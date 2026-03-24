import { useInfiniteQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Enums } from '@/types/database'

const PAGE_SIZE = 20

export type SearchResultPost = {
  id: number
  title: string
  content: string
  author_id: string
  category_tool: Enums<'category_tool_type'> | null
  category_task: Enums<'category_task_type'> | null
  view_count: number
  like_count: number
  comment_count: number
  created_at: string
  rank: number | null
  highlighted_title: string | null
  highlighted_content: string | null
  author: {
    nickname: string
    avatar_url: string | null
  } | null
}

export type SearchSortOption = 'relevance' | 'latest'

interface UseSearchParams {
  query: string
  sort?: SearchSortOption
}

export function useSearch({ query, sort = 'relevance' }: UseSearchParams) {
  return useInfiniteQuery({
    queryKey: ['search', query, sort],
    queryFn: async ({ pageParam }) => {
      if (!query.trim()) return [] as SearchResultPost[]

      const rl = await fetch('/api/rate-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_type: 'search' }),
      })
      if (rl.status === 429) throw new Error('잠시 후 다시 시도해주세요.')

      const supabase = createClient()

      if (sort === 'relevance') {
        const offset = (pageParam as number) * PAGE_SIZE
        const { data, error } = await supabase.rpc('search_posts', {
          query_text: query,
          p_limit: PAGE_SIZE,
          p_offset: offset,
        })
        if (error) throw error

        // search_posts RPC는 author를 JOIN하지 않으므로 별도로 가져옴
        const rows = (data ?? []) as Omit<SearchResultPost, 'author'>[]
        if (rows.length === 0) return [] as SearchResultPost[]

        const authorIds = [...new Set(rows.map((r) => r.author_id))]
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, nickname, avatar_url')
          .in('id', authorIds)
        if (usersError) throw usersError

        const userMap = new Map(
          (users ?? []).map((u) => [u.id, { nickname: u.nickname, avatar_url: u.avatar_url }])
        )

        return rows.map((row) => ({
          ...row,
          author: userMap.get(row.author_id) ?? null,
        })) as SearchResultPost[]
      }

      // sort === 'latest': posts 테이블 직접 ILIKE 검색
      const offset = (pageParam as number) * PAGE_SIZE
      const { data, error } = await supabase
        .from('posts')
        .select('*, author:users!posts_author_id_fkey(nickname, avatar_url)')
        .eq('is_deleted', false)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1)

      if (error) throw error

      return (data ?? []).map((row) => ({
        ...row,
        rank: null,
        highlighted_title: null,
        highlighted_content: null,
      })) as SearchResultPost[]
    },
    initialPageParam: 0 as number,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined
      return allPages.length
    },
    enabled: !!query.trim(),
  })
}

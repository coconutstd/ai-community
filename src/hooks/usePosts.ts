import { useInfiniteQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Tables, Enums } from '@/types/database'

export type PostWithAuthor = Tables<'posts'> & {
  author: {
    nickname: string
    avatar_url: string | null
  } | null
}

interface UsePostsParams {
  category_tool?: string
  category_task?: string
}

const PAGE_SIZE = 10

export function usePosts({ category_tool, category_task }: UsePostsParams = {}) {
  return useInfiniteQuery({
    queryKey: ['posts', { category_tool, category_task }],
    queryFn: async ({ pageParam }) => {
      const supabase = createClient()
      let query = supabase
        .from('posts')
        .select('*, author:users!posts_author_id_fkey(nickname, avatar_url)')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE)

      if (category_tool)
        query = query.eq('category_tool', category_tool as Enums<'category_tool_type'>)
      if (category_task)
        query = query.eq('category_task', category_task as Enums<'category_task_type'>)
      if (pageParam) query = query.lt('created_at', pageParam)

      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as PostWithAuthor[]
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      if (lastPage.length < PAGE_SIZE) return undefined
      return lastPage[lastPage.length - 1].created_at
    },
  })
}

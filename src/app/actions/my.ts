'use server'

import { createClient } from '@/lib/supabase/server'
import type { PostWithAuthor } from '@/hooks/usePosts'

export type BookmarkedPost = PostWithAuthor & {
  bookmarkedAt: string
}

export async function getMyPosts(cursor?: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  let query = supabase
    .from('posts')
    .select('*, author:users!posts_author_id_fkey(nickname, avatar_url)')
    .eq('is_deleted', false)
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (cursor) query = query.lt('created_at', cursor)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as PostWithAuthor[]
}

export async function getMyBookmarks(cursor?: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  type BookmarkRow = {
    created_at: string
    post_id: number
    user_id: string
    posts: PostWithAuthor | null
  }

  let query = supabase
    .from('bookmarks')
    .select(
      'created_at, post_id, user_id, posts!bookmarks_post_id_fkey(*, author:users!posts_author_id_fkey(nickname, avatar_url))'
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (cursor) query = query.lt('created_at', cursor)

  const { data, error } = await query
  if (error) throw error

  const rows = (data ?? []) as unknown as BookmarkRow[]

  return rows
    .filter((row) => row.posts !== null && !row.posts.is_deleted)
    .map((row) => ({
      ...(row.posts as PostWithAuthor),
      bookmarkedAt: row.created_at,
    })) as BookmarkedPost[]
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// --- 내부 헬퍼 ---

async function verifyAdmin(): Promise<{ userId: string } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: '로그인이 필요합니다.' }

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return { error: '관리자 권한이 필요합니다.' }

  return { userId: user.id }
}

// --- 게시글 관리 ---

export type AdminPost = {
  id: number
  title: string
  is_deleted: boolean
  deleted_at: string | null
  created_at: string
  view_count: number
  like_count: number
  author: { nickname: string } | null
}

export type AdminPostsResult = {
  posts: AdminPost[]
  totalPages: number
  currentPage: number
}

export async function getAdminPosts(
  page: number = 1,
  pageSize: number = 20,
): Promise<AdminPostsResult | { error: string }> {
  const auth = await verifyAdmin()
  if ('error' in auth) return auth

  const adminSupabase = createAdminClient()
  const offset = (page - 1) * pageSize

  const { data, error, count } = await adminSupabase
    .from('posts')
    .select('id, title, is_deleted, deleted_at, created_at, view_count, like_count, author:users!posts_author_id_fkey(nickname)', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (error) return { error: '게시글 목록을 불러오지 못했습니다.' }

  const totalPages = Math.ceil((count ?? 0) / pageSize)

  return {
    posts: (data ?? []) as AdminPost[],
    totalPages,
    currentPage: page,
  }
}

// --- 댓글 관리 ---

export type AdminComment = {
  id: number
  content: string
  is_deleted: boolean
  deleted_at: string | null
  created_at: string
  author_id: string
  post_id: number
  author: { nickname: string } | null
  post: { title: string } | null
}

export type AdminCommentsResult = {
  comments: AdminComment[]
  totalPages: number
  currentPage: number
}

export async function getAdminComments(
  page: number = 1,
  pageSize: number = 30,
): Promise<AdminCommentsResult | { error: string }> {
  const auth = await verifyAdmin()
  if ('error' in auth) return auth

  const adminSupabase = createAdminClient()
  const offset = (page - 1) * pageSize

  const { data, error, count } = await adminSupabase
    .from('comments')
    .select(
      'id, content, is_deleted, deleted_at, created_at, author_id, post_id, author:users!comments_author_id_fkey(nickname), post:posts!comments_post_id_fkey(title)',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (error) return { error: '댓글 목록을 불러오지 못했습니다.' }

  const totalPages = Math.ceil((count ?? 0) / pageSize)

  return {
    comments: (data ?? []) as AdminComment[],
    totalPages,
    currentPage: page,
  }
}

// --- 삭제 액션 ---

export async function adminDeletePost(postId: number): Promise<{ error?: string }> {
  const auth = await verifyAdmin()
  if ('error' in auth) return auth

  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase
    .from('posts')
    .update({ is_deleted: true, deleted_at: new Date().toISOString() })
    .eq('id', postId)

  if (error) return { error: '게시글 삭제에 실패했습니다.' }

  revalidatePath('/admin/posts')
  revalidatePath('/')
  return {}
}

export async function adminDeleteComment(commentId: number): Promise<{ error?: string }> {
  const auth = await verifyAdmin()
  if ('error' in auth) return auth

  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase
    .from('comments')
    .update({ is_deleted: true, deleted_at: new Date().toISOString() })
    .eq('id', commentId)

  if (error) return { error: '댓글 삭제에 실패했습니다.' }

  revalidatePath('/admin/comments')
  return {}
}

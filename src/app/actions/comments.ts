'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { checkRateLimit } from '@/lib/utils/rateLimit'

export async function createComment(
  postId: number,
  content: string
): Promise<{ commentId: number } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: '로그인이 필요합니다.' }

  const { allowed } = await checkRateLimit(user.id, 'comment')
  if (!allowed) return { error: '잠시 후 다시 시도해주세요.' }

  const trimmed = content.trim()
  if (!trimmed) return { error: '댓글 내용을 입력해주세요.' }
  if (trimmed.length > 500) return { error: '댓글은 500자 이내로 작성해주세요.' }

  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, author_id: user.id, content: trimmed })
    .select('id')
    .single()

  if (error || !data) return { error: '댓글 등록에 실패했습니다.' }

  revalidatePath(`/posts/${postId}`)
  return { commentId: data.id }
}

export async function deleteComment(
  commentId: number,
  postId: number
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: '로그인이 필요합니다.' }

  const { data: comment, error: fetchError } = await supabase
    .from('comments')
    .select('author_id')
    .eq('id', commentId)
    .eq('is_deleted', false)
    .single()

  if (fetchError || !comment) return { error: '댓글을 찾을 수 없습니다.' }

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (comment.author_id !== user.id && !profile?.is_admin) {
    return { error: '삭제 권한이 없습니다.' }
  }

  const { error } = await supabase
    .from('comments')
    .update({ is_deleted: true, deleted_at: new Date().toISOString() })
    .eq('id', commentId)

  if (error) return { error: '댓글 삭제에 실패했습니다.' }

  revalidatePath(`/posts/${postId}`)
  return {}
}

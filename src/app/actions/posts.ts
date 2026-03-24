'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Enums } from '@/types/database'
import { checkRateLimit } from '@/lib/utils/rateLimit'

interface CreatePostInput {
  title: string
  content: string
  category_tool?: Enums<'category_tool_type'> | null
  category_task?: Enums<'category_task_type'> | null
  mediaIds?: string[]
}

interface UpdatePostInput {
  title: string
  content: string
  category_tool?: Enums<'category_tool_type'> | null
  category_task?: Enums<'category_task_type'> | null
}

export async function createPost(
  formData: CreatePostInput
): Promise<{ postId: number } | { error: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const { allowed } = await checkRateLimit(user.id, 'post')
  if (!allowed) return { error: '잠시 후 다시 시도해주세요.' }

  const { data: post, error: insertError } = await supabase
    .from('posts')
    .insert({
      author_id: user.id,
      title: formData.title,
      content: formData.content,
      category_tool: formData.category_tool ?? null,
      category_task: formData.category_task ?? null,
    })
    .select('id')
    .single()

  if (insertError || !post) {
    return { error: '게시글 작성에 실패했습니다.' }
  }

  if (formData.mediaIds && formData.mediaIds.length > 0) {
    await supabase
      .from('media')
      .update({ is_used: true, post_id: post.id })
      .in('id', formData.mediaIds)
  }

  revalidatePath('/')
  revalidatePath('/posts')

  return { postId: post.id }
}

export async function updatePost(
  postId: number,
  formData: UpdatePostInput
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const { data: existing, error: fetchError } = await supabase
    .from('posts')
    .select('author_id')
    .eq('id', postId)
    .eq('is_deleted', false)
    .single()

  if (fetchError || !existing) {
    return { error: '게시글을 찾을 수 없습니다.' }
  }

  if (existing.author_id !== user.id) {
    return { error: '수정 권한이 없습니다.' }
  }

  const { error: updateError } = await supabase
    .from('posts')
    .update({
      title: formData.title,
      content: formData.content,
      category_tool: formData.category_tool ?? null,
      category_task: formData.category_task ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId)

  if (updateError) {
    return { error: '게시글 수정에 실패했습니다.' }
  }

  revalidatePath('/')
  revalidatePath('/posts')
  revalidatePath(`/posts/${postId}`)

  return {}
}

export async function deletePost(postId: number): Promise<{ error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  // 작성자 또는 관리자 확인
  const { data: existing, error: fetchError } = await supabase
    .from('posts')
    .select('author_id')
    .eq('id', postId)
    .eq('is_deleted', false)
    .single()

  if (fetchError || !existing) {
    return { error: '게시글을 찾을 수 없습니다.' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const isAuthor = existing.author_id === user.id
  const isAdmin = profile?.is_admin ?? false

  if (!isAuthor && !isAdmin) {
    return { error: '삭제 권한이 없습니다.' }
  }

  const { error: deleteError } = await supabase
    .from('posts')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    })
    .eq('id', postId)

  if (deleteError) {
    return { error: '게시글 삭제에 실패했습니다.' }
  }

  revalidatePath('/')
  revalidatePath('/posts')

  return {}
}

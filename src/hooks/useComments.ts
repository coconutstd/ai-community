import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import { createComment, deleteComment } from '@/app/actions/comments'
import type { Tables } from '@/types/database'

export type CommentWithAuthor = Tables<'comments'> & {
  author: { nickname: string; avatar_url: string | null } | null
}

export function useComments({ postId }: { postId: number }) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('comments')
        .select('*, author:users!comments_author_id_fkey(nickname, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return (data ?? []) as CommentWithAuthor[]
    },
  })
}

export function useAddComment() {
  const queryClient = useQueryClient()
  const { profile } = useAuthStore()

  return useMutation({
    mutationFn: ({ postId, content }: { postId: number; content: string }) =>
      createComment(postId, content),
    onMutate: async ({ postId, content }) => {
      await queryClient.cancelQueries({ queryKey: ['comments', postId] })
      const snapshot = queryClient.getQueryData<CommentWithAuthor[]>(['comments', postId])

      const optimisticComment: CommentWithAuthor = {
        id: -Date.now(),
        post_id: postId,
        author_id: '',
        content,
        is_deleted: false,
        deleted_at: null,
        created_at: new Date().toISOString(),
        author: {
          nickname: profile?.nickname ?? '...',
          avatar_url: profile?.avatar_url ?? null,
        },
      }

      queryClient.setQueryData<CommentWithAuthor[]>(['comments', postId], (prev) => [
        ...(prev ?? []),
        optimisticComment,
      ])

      return { snapshot, postId }
    },
    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(['comments', context.postId], context.snapshot)
      }
      toast.error('댓글 등록에 실패했습니다. 다시 시도해주세요.')
    },
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
    },
  })
}

export function useDeleteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, postId }: { commentId: number; postId: number }) =>
      deleteComment(commentId, postId),
    onMutate: async ({ commentId, postId }) => {
      await queryClient.cancelQueries({ queryKey: ['comments', postId] })
      const snapshot = queryClient.getQueryData<CommentWithAuthor[]>(['comments', postId])

      queryClient.setQueryData<CommentWithAuthor[]>(['comments', postId], (prev) =>
        (prev ?? []).map((c) => (c.id === commentId ? { ...c, is_deleted: true } : c))
      )

      return { snapshot, postId }
    },
    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(['comments', context.postId], context.snapshot)
      }
      toast.error('댓글 삭제에 실패했습니다. 다시 시도해주세요.')
    },
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
    },
  })
}

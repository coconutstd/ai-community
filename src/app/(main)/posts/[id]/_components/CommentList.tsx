'use client'

import { toast } from 'sonner'
import { useComments, useAddComment, useDeleteComment } from '@/hooks/useComments'
import { CommentForm } from './CommentForm'
import { CommentItem } from './CommentItem'

interface CommentListProps {
  postId: number
  currentUserId: string | null
}

export function CommentList({ postId, currentUserId }: CommentListProps) {
  const { data: comments, isLoading } = useComments({ postId })
  const { mutateAsync: addCommentMutate, isPending: isAddPending } = useAddComment()
  const { mutate: deleteCommentMutate, isPending: isDeletePending } = useDeleteComment()

  const activeCount = comments?.filter((c) => !c.is_deleted).length ?? 0

  return (
    <section aria-label="댓글">
      <h2 className="text-base font-semibold text-gray-900">
        댓글 <span className="text-blue-600">{activeCount}</span>개
      </h2>

      <CommentForm
        postId={postId}
        onSubmit={async (content) => {
          const result = await addCommentMutate({ postId, content })
          if (result && 'error' in result) toast.error(result.error)
        }}
        isSubmitting={isAddPending}
      />

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-4" aria-label="댓글 로딩 중">
            {[1, 2, 3].map((i) => (
              <div key={i} className="py-4 border-b border-gray-100 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-gray-200" />
                  <div className="h-3 w-24 rounded bg-gray-200" />
                  <div className="h-3 w-16 rounded bg-gray-100" />
                </div>
                <div className="mt-2 pl-9 space-y-1.5">
                  <div className="h-3 w-full rounded bg-gray-100" />
                  <div className="h-3 w-3/4 rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : !comments?.length ? (
          <p className="text-center text-sm text-gray-400 py-8">첫 댓글을 남겨보세요.</p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onDelete={(commentId) => deleteCommentMutate({ commentId, postId })}
              isDeleting={isDeletePending}
            />
          ))
        )}
      </div>
    </section>
  )
}

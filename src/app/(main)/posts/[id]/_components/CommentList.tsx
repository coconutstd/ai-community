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
    <section id="comments" aria-label="댓글">
      <h2 className="text-[18px] font-bold text-white">
        댓글 <span className="text-[#3b82f6]">{activeCount}</span>
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
              <div key={i} className="py-4 border-b border-[rgba(255,255,255,0.06)] animate-pulse">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-[#1e293b]" />
                  <div className="h-3 w-24 rounded bg-[#1e293b]" />
                  <div className="h-3 w-16 rounded bg-[#1e293b]" />
                </div>
                <div className="mt-2 pl-[42px] space-y-1.5">
                  <div className="h-3 w-full rounded bg-[#1e293b]" />
                  <div className="h-3 w-3/4 rounded bg-[#1e293b]" />
                </div>
              </div>
            ))}
          </div>
        ) : !comments?.length ? (
          <p className="text-center text-[14px] text-[#475569] py-10">첫 댓글을 남겨보세요.</p>
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

'use client'

import { useRef, useState, useLayoutEffect } from 'react'
import { formatRelativeDate } from '@/lib/utils/date'
import type { CommentWithAuthor } from '@/hooks/useComments'

interface CommentItemProps {
  comment: CommentWithAuthor
  currentUserId: string | null
  onDelete: (commentId: number) => void
  isDeleting: boolean
}

export function CommentItem({ comment, currentUserId, onDelete, isDeleting }: CommentItemProps) {
  const contentRef = useRef<HTMLParagraphElement>(null)
  const [isClamped, setIsClamped] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useLayoutEffect(() => {
    const el = contentRef.current
    if (el) setIsClamped(el.scrollHeight > el.clientHeight)
  }, [comment.content])

  if (comment.is_deleted) {
    return (
      <div className="py-3 border-b border-gray-100 last:border-0">
        <p className="text-sm text-gray-400 italic">삭제된 댓글입니다.</p>
        <time className="text-xs text-gray-300">{formatRelativeDate(comment.created_at)}</time>
      </div>
    )
  }

  const isAuthor = comment.author_id === currentUserId

  return (
    <div className="py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {comment.author?.avatar_url ? (
            <img
              src={comment.author.avatar_url}
              alt={comment.author.nickname}
              className="h-7 w-7 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="h-7 w-7 rounded-full bg-gray-200 flex-shrink-0" aria-hidden="true" />
          )}
          <span className="text-sm font-medium text-gray-800 truncate">
            {comment.author?.nickname ?? '알 수 없음'}
          </span>
          <time className="text-xs text-gray-400 flex-shrink-0">
            {formatRelativeDate(comment.created_at)}
          </time>
        </div>

        {isAuthor && (
          <button
            onClick={() => onDelete(comment.id)}
            disabled={isDeleting}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 disabled:opacity-50"
            aria-label="댓글 삭제"
          >
            삭제
          </button>
        )}
      </div>

      <div className="mt-2 pl-9">
        <p
          ref={contentRef}
          className={`text-sm text-gray-700 whitespace-pre-wrap break-words ${
            !isExpanded ? 'line-clamp-5' : ''
          }`}
        >
          {comment.content}
        </p>
        {isClamped && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="mt-1 text-xs text-blue-500 hover:text-blue-700"
          >
            더 보기
          </button>
        )}
        {isExpanded && (
          <button
            onClick={() => setIsExpanded(false)}
            className="mt-1 text-xs text-blue-500 hover:text-blue-700"
          >
            접기
          </button>
        )}
      </div>
    </div>
  )
}

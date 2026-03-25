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
      <div className="py-4 border-b border-[rgba(255,255,255,0.06)] last:border-0">
        <p className="text-[13px] text-[#4b5563] italic">삭제된 댓글입니다.</p>
        <time className="text-[11px] text-[#374151]">{formatRelativeDate(comment.created_at)}</time>
      </div>
    )
  }

  const isAuthor = comment.author_id === currentUserId
  const avatarInitial = comment.author?.nickname?.[0]?.toUpperCase() ?? 'U'

  return (
    <div className="py-4 border-b border-[rgba(255,255,255,0.06)] last:border-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center flex-shrink-0 text-[12px] font-bold text-white overflow-hidden">
            {comment.author?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={comment.author.avatar_url} alt={comment.author.nickname} className="w-full h-full object-cover" />
            ) : (
              avatarInitial
            )}
          </div>
          <span className="text-[14px] font-medium text-white truncate">
            {comment.author?.nickname ?? '알 수 없음'}
          </span>
          <time className="text-[12px] text-[#475569] flex-shrink-0">
            {formatRelativeDate(comment.created_at)}
          </time>
        </div>

        {isAuthor && (
          <button
            onClick={() => onDelete(comment.id)}
            disabled={isDeleting}
            className="text-[12px] text-[#475569] hover:text-red-400 transition-colors flex-shrink-0 disabled:opacity-50"
            aria-label="댓글 삭제"
          >
            삭제
          </button>
        )}
      </div>

      <div className="mt-2 pl-[42px]">
        <p
          ref={contentRef}
          className={`text-[14px] text-[#cbd5e1] whitespace-pre-wrap break-words leading-relaxed ${
            !isExpanded ? 'line-clamp-5' : ''
          }`}
        >
          {comment.content}
        </p>
        {isClamped && !isExpanded && (
          <button onClick={() => setIsExpanded(true)} className="mt-1 text-[12px] text-[#3b82f6] hover:text-[#60a5fa]">
            더 보기
          </button>
        )}
        {isExpanded && (
          <button onClick={() => setIsExpanded(false)} className="mt-1 text-[12px] text-[#3b82f6] hover:text-[#60a5fa]">
            접기
          </button>
        )}
      </div>
    </div>
  )
}

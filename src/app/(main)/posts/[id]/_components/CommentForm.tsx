'use client'

import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'

interface CommentFormProps {
  postId: number
  onSubmit: (content: string) => Promise<void>
  isSubmitting: boolean
}

export function CommentForm({ onSubmit, isSubmitting }: CommentFormProps) {
  const { user, openLoginModal } = useAuthStore()
  const [content, setContent] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isSubmitting) return
    await onSubmit(content)
    setContent('')
  }

  const isNearLimit = content.length >= 450

  return (
    <form onSubmit={handleSubmit} className="mt-5">
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onClick={() => {
            if (!user) openLoginModal()
          }}
          placeholder={user ? '댓글을 입력해주세요.' : '로그인 후 댓글을 남길 수 있습니다.'}
          maxLength={500}
          rows={3}
          className="w-full resize-none rounded-[12px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] px-4 py-3 text-[14px] text-white placeholder:text-[#4b5563] focus:border-[rgba(59,130,246,0.4)] focus:outline-none transition-colors"
          aria-label="댓글 입력"
        />
        <span
          className={`absolute bottom-3 right-4 text-[11px] ${isNearLimit ? 'text-red-400' : 'text-[#4b5563]'}`}
          aria-live="polite"
        >
          {content.length}/500
        </span>
      </div>
      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="rounded-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] px-5 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '등록 중...' : '댓글 등록'}
        </button>
      </div>
    </form>
  )
}

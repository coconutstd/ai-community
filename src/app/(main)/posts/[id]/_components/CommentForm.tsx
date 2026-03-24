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
    <form onSubmit={handleSubmit} className="mt-4">
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
          className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors"
          aria-label="댓글 입력"
        />
        <span
          className={`absolute bottom-2.5 right-3 text-xs ${
            isNearLimit ? 'text-red-500' : 'text-gray-400'
          }`}
          aria-live="polite"
        >
          {content.length}/500
        </span>
      </div>

      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '등록 중...' : '댓글 등록'}
        </button>
      </div>
    </form>
  )
}

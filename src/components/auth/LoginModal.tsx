'use client'

import { useEffect, useRef, Suspense } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { LoginForm } from './LoginForm'
import { Spinner } from '@/components/ui/Spinner'

export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal } = useAuthStore()
  const overlayRef = useRef<HTMLDivElement>(null)

  // 모달 열릴 때 body 스크롤 잠금
  useEffect(() => {
    if (isLoginModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isLoginModalOpen])

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLoginModal()
    }
    if (isLoginModalOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isLoginModalOpen, closeLoginModal])

  if (!isLoginModalOpen) return null

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeLoginModal}
        aria-hidden="true"
      />

      {/* 모달 카드 */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        {/* 닫기 버튼 */}
        <button
          type="button"
          onClick={closeLoginModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="모달 닫기"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="mb-6">
          <h2
            id="login-modal-title"
            className="text-xl font-semibold text-gray-900"
          >
            로그인이 필요합니다
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            이 기능을 사용하려면 로그인해 주세요
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          }
        >
          <LoginForm onSuccess={closeLoginModal} />
        </Suspense>
      </div>
    </div>
  )
}

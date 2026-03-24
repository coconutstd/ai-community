import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { Spinner } from '@/components/ui/Spinner'

export const metadata: Metadata = {
  title: '로그인 | AI 커뮤니티',
  description: 'AI 커뮤니티에 로그인하세요.',
}

export default function LoginPage() {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">로그인</h2>
        <p className="mt-1 text-sm text-gray-500">
          커뮤니티에 오신 것을 환영합니다
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </>
  )
}

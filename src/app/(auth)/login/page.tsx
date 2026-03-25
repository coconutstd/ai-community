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
      <div className="text-center mb-10">
        <h2 className="text-[30px] font-bold text-white leading-[36px] mb-3">환영합니다</h2>
        <p className="text-[#9ca3af] text-[16px]">사내 AI 활용 노하우를 한 곳에서</p>
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

import type { Metadata } from 'next'
import { SignupForm } from '@/components/auth/SignupForm'

export const metadata: Metadata = {
  title: '회원가입 | AI 커뮤니티',
  description: 'AI 커뮤니티에 가입하고 AI 활용 팁을 공유하세요.',
}

export default function SignupPage() {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">회원가입</h2>
        <p className="mt-1 text-sm text-gray-500">
          계정을 만들고 커뮤니티에 참여하세요
        </p>
      </div>
      <SignupForm />
    </>
  )
}

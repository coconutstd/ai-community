import type { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export const metadata: Metadata = {
  title: '비밀번호 찾기 | AI 커뮤니티',
  description: '비밀번호를 재설정합니다.',
}

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">비밀번호 찾기</h2>
        <p className="mt-1 text-sm text-gray-500">
          등록된 이메일로 재설정 링크를 보내드립니다
        </p>
      </div>
      <ForgotPasswordForm />
    </>
  )
}

import type { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = {
  title: '비밀번호 재설정 | AI 커뮤니티',
  description: '새로운 비밀번호를 설정합니다.',
}

export default function ResetPasswordPage() {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">비밀번호 재설정</h2>
        <p className="mt-1 text-sm text-gray-500">
          새로운 비밀번호를 입력해 주세요
        </p>
      </div>
      <ResetPasswordForm />
    </>
  )
}

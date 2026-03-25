import type { Metadata } from 'next'
import { SignupForm } from '@/components/auth/SignupForm'

export const metadata: Metadata = {
  title: '회원가입 | AI 커뮤니티',
  description: 'AI 커뮤니티에 가입하고 AI 활용 팁을 공유하세요.',
}

export default function SignupPage() {
  return (
    <>
      <div className="text-center mb-10">
        <h2 className="text-[30px] font-bold text-white leading-[36px] mb-3">회원가입</h2>
        <p className="text-[#9ca3af] text-[16px]">새로운 계정을 만들어보세요</p>
      </div>
      <SignupForm />
    </>
  )
}

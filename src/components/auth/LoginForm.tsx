'use client'

import { useState } from 'react'
import { useCapsLock } from '@/hooks/useCapsLock'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { loginSchema, type LoginFormValues } from '@/lib/validations/auth'
import { useAuthStore } from '@/stores/authStore'
import Link from 'next/link'

interface LoginFormProps {
  onSuccess?: () => void
}

function formatLockDuration(lockUntil: string): string {
  const remaining = new Date(lockUntil).getTime() - new Date().getTime()
  if (remaining <= 0) return '잠시'
  const minutes = Math.ceil(remaining / 1000 / 60)
  return `${minutes}분`
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/'
  const callbackError = searchParams.get('error')

  const [rememberMe, setRememberMe] = useState(false)
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)
  const isCapsLockOn = useCapsLock()
  const [formError, setFormError] = useState<string | null>(
    callbackError === 'auth_callback_failed'
      ? '이메일 인증에 실패했습니다. 다시 시도해 주세요.'
      : null
  )

  const { setUser, setProfile } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const { onBlur: pwOnBlur, ...pwRest } = register('password')

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null)
    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    // 로그인 시도 기록 (성공/실패 무관하게 항상 호출)
    await supabase.rpc('handle_login_attempt', {
      p_email: values.email,
      p_success: !error,
    })

    if (error) {
      setFormError('이메일 또는 비밀번호가 올바르지 않습니다.')
      return
    }

    // 로그인 잠금 체크
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profile?.login_lock_until) {
      const lockTime = new Date(profile.login_lock_until).getTime()
      if (lockTime > new Date().getTime()) {
        const duration = formatLockDuration(profile.login_lock_until)
        setFormError(`계정이 잠겼습니다. ${duration} 후 재시도해 주세요.`)
        await supabase.auth.signOut()
        return
      }
    }

    setUser(data.user)
    if (profile) setProfile(profile)

    toast.success('로그인되었습니다.')

    if (onSuccess) {
      onSuccess()
    } else {
      router.push(redirectTo)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {formError && (
        <div role="alert" className="rounded-[8px] bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] px-4 py-3 text-sm text-red-400">
          {formError}
        </div>
      )}

      {/* 이메일 */}
      <div className="space-y-2">
        <label className="block text-[14px] font-medium text-[#d1d5db]">이메일</label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="#6b7280" strokeWidth="1.2"/>
              <path d="M1 4.5l7 5 7-5" stroke="#6b7280" strokeWidth="1.2"/>
            </svg>
          </div>
          <input
            type="email"
            placeholder="name@company.com"
            autoComplete="email"
            className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[12px] pl-[45px] pr-[17px] py-[17px] text-white placeholder:text-[#6b7280] text-[16px] outline-none focus:border-[rgba(59,130,246,0.5)] focus:bg-[rgba(59,130,246,0.03)] transition-colors"
            {...register('email')}
          />
        </div>
        {errors.email && <p className="text-[12px] text-red-400">{errors.email.message}</p>}
      </div>

      {/* 비밀번호 */}
      <div className="space-y-2">
        <label className="block text-[14px] font-medium text-[#d1d5db]">비밀번호</label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
              <rect x="1" y="7" width="12" height="8" rx="2" stroke="#6b7280" strokeWidth="1.2"/>
              <path d="M4 7V5a3 3 0 016 0v2" stroke="#6b7280" strokeWidth="1.2"/>
            </svg>
          </div>
          <input
            type="password"
            placeholder="비밀번호를 입력하세요"
            autoComplete="current-password"
            className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[12px] pl-[45px] pr-[17px] py-[15px] text-white placeholder:text-[#6b7280] text-[16px] outline-none focus:border-[rgba(59,130,246,0.5)] focus:bg-[rgba(59,130,246,0.03)] transition-colors"
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={(e) => { void pwOnBlur(e); setIsPasswordFocused(false) }}
            {...pwRest}
          />
        </div>
        {isCapsLockOn && isPasswordFocused && (
          <p className="text-xs text-amber-400">⚠ Caps Lock이 켜져 있습니다</p>
        )}
        {errors.password && <p className="text-[12px] text-red-400">{errors.password.message}</p>}
      </div>

      {/* 로그인 상태 유지 + 비밀번호 찾기 */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-[#767676]"
          />
          <span className="text-[14px] text-[#9ca3af]">로그인 상태 유지</span>
        </label>
        <Link href="/forgot-password" className="text-[14px] text-[#3b82f6] hover:text-[#60a5fa] transition-colors">
          비밀번호 찾기
        </Link>
      </div>

      {/* 로그인 버튼 */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white font-bold text-[16px] py-[14px] rounded-[12px] shadow-[0px_10px_15px_-3px_rgba(59,130,246,0.25),0px_4px_6px_-4px_rgba(59,130,246,0.25)] hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
      >
        {isSubmitting ? '로그인 중...' : '로그인'}
      </button>

      {/* 회원가입 링크 */}
      <p className="text-center text-[14px] text-[#9ca3af]">
        계정이 없으신가요?{' '}
        <Link href="/signup" className="text-[#3b82f6] font-medium hover:text-[#60a5fa] transition-colors">
          회원가입
        </Link>
      </p>
    </form>
  )
}

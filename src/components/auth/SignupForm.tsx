'use client'

import { useState, useEffect, useCallback } from 'react'
import { useCapsLock } from '@/hooks/useCapsLock'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { signupSchema, type SignupFormValues } from '@/lib/validations/auth'
import Link from 'next/link'

type NicknameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error'

export function SignupForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [nicknameStatus, setNicknameStatus] = useState<NicknameStatus>('idle')
  const [focusedPasswordField, setFocusedPasswordField] = useState<'password' | 'confirmPassword' | null>(null)
  const isCapsLockOn = useCapsLock()

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  })

  const nicknameValue = watch('nickname')

  const checkNickname = useCallback(
    async (nickname: string) => {
      const trimmed = nickname.trim()
      if (trimmed.length < 2 || trimmed.length > 20) {
        setNicknameStatus('idle')
        return
      }
      if (!/^[가-힣a-zA-Z0-9]+$/.test(trimmed)) {
        setNicknameStatus('idle')
        return
      }

      setNicknameStatus('checking')
      try {
        const res = await fetch(
          `/api/auth/check-nickname?nickname=${encodeURIComponent(trimmed)}`
        )
        const json = await res.json()

        if (json.available) {
          setNicknameStatus('available')
          clearErrors('nickname')
        } else {
          setNicknameStatus('taken')
          setError('nickname', { message: '이미 사용 중인 닉네임입니다.' })
        }
      } catch {
        setNicknameStatus('error')
      }
    },
    [setError, clearErrors]
  )

  useEffect(() => {
    if (!nicknameValue) {
      setNicknameStatus('idle')
      return
    }

    const timer = setTimeout(() => {
      checkNickname(nicknameValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [nicknameValue, checkNickname])

  const onSubmit = async (values: SignupFormValues) => {
    if (nicknameStatus === 'taken') {
      setError('nickname', { message: '이미 사용 중인 닉네임입니다.' })
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        data: {
          nickname: values.nickname,
        },
      },
    })

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        setError('email', { message: '이미 가입된 이메일입니다.' })
      } else if (error.message.includes('rate limit')) {
        toast.error('잠시 후 다시 시도해 주세요.')
      } else {
        toast.error('회원가입 중 오류가 발생했습니다. 다시 시도해 주세요.')
      }
      return
    }

    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white">이메일을 확인해 주세요</h2>
        <p className="text-[#9ca3af] text-sm leading-relaxed">
          인증 링크를 이메일로 발송했습니다.<br />
          받은 편지함에서 링크를 클릭하면 가입이 완료됩니다.
        </p>
        <p className="text-xs text-[#64748b]">이메일이 오지 않으면 스팸 폴더를 확인해 주세요.</p>
        <div className="pt-2">
          <Link href="/login" className="text-sm text-[#3b82f6] hover:text-[#60a5fa] font-medium transition-colors">
            로그인 페이지로 이동
          </Link>
        </div>
      </div>
    )
  }

  const { onBlur: pwOnBlur, ...pwRest } = register('password')
  const { onBlur: confirmOnBlur, ...confirmRest } = register('confirmPassword')

  const nicknameHelperText =
    nicknameStatus === 'checking'
      ? '중복 확인 중...'
      : nicknameStatus === 'available'
        ? '사용 가능한 닉네임입니다.'
        : undefined

  const nicknameHelperClass =
    nicknameStatus === 'available' ? 'text-green-400' : 'text-[#94a3b8]'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* 이메일 */}
      <div className="space-y-2">
        <label htmlFor="signup-email" className="block text-[14px] font-medium text-[#d1d5db]">이메일</label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="#6b7280" strokeWidth="1.2"/>
              <path d="M1 4.5l7 5 7-5" stroke="#6b7280" strokeWidth="1.2"/>
            </svg>
          </div>
          <input
            id="signup-email"
            type="email"
            placeholder="name@company.com"
            autoComplete="email"
            className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[12px] pl-[45px] pr-[17px] py-[17px] text-white placeholder:text-[#6b7280] text-[16px] outline-none focus:border-[rgba(59,130,246,0.5)] focus:bg-[rgba(59,130,246,0.03)] transition-colors"
            {...register('email')}
          />
        </div>
        {errors.email && <p className="text-[12px] text-red-400">{errors.email.message}</p>}
      </div>

      {/* 닉네임 */}
      <div className="space-y-2">
        <label htmlFor="nickname" className="block text-[14px] font-medium text-[#d1d5db]">닉네임</label>
        <input
          id="nickname"
          type="text"
          placeholder="2~20자 (한글, 영문, 숫자)"
          autoComplete="nickname"
          className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[12px] px-[17px] py-[15px] text-white placeholder:text-[#6b7280] text-[16px] outline-none focus:border-[rgba(59,130,246,0.5)] focus:bg-[rgba(59,130,246,0.03)] transition-colors"
          {...register('nickname')}
        />
        {errors.nickname ? (
          <p className="text-[12px] text-red-400">{errors.nickname.message}</p>
        ) : nicknameHelperText ? (
          <p className={`text-xs ${nicknameHelperClass}`}>{nicknameHelperText}</p>
        ) : null}
      </div>

      {/* 비밀번호 */}
      <div className="space-y-2">
        <label htmlFor="signup-password" className="block text-[14px] font-medium text-[#d1d5db]">비밀번호</label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
              <rect x="1" y="7" width="12" height="8" rx="2" stroke="#6b7280" strokeWidth="1.2"/>
              <path d="M4 7V5a3 3 0 016 0v2" stroke="#6b7280" strokeWidth="1.2"/>
            </svg>
          </div>
          <input
            id="signup-password"
            type="password"
            placeholder="8자 이상 (영문, 숫자, 특수문자 포함)"
            autoComplete="new-password"
            className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[12px] pl-[45px] pr-[17px] py-[15px] text-white placeholder:text-[#6b7280] text-[16px] outline-none focus:border-[rgba(59,130,246,0.5)] focus:bg-[rgba(59,130,246,0.03)] transition-colors"
            onFocus={() => setFocusedPasswordField('password')}
            onBlur={(e) => { void pwOnBlur(e); setFocusedPasswordField(null) }}
            {...pwRest}
          />
        </div>
        {isCapsLockOn && focusedPasswordField === 'password' && (
          <p className="text-xs text-amber-400">⚠ Caps Lock이 켜져 있습니다</p>
        )}
        {errors.password && <p className="text-[12px] text-red-400">{errors.password.message}</p>}
      </div>

      {/* 비밀번호 확인 */}
      <div className="space-y-2">
        <label htmlFor="signup-confirm-password" className="block text-[14px] font-medium text-[#d1d5db]">비밀번호 확인</label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
              <rect x="1" y="7" width="12" height="8" rx="2" stroke="#6b7280" strokeWidth="1.2"/>
              <path d="M4 7V5a3 3 0 016 0v2" stroke="#6b7280" strokeWidth="1.2"/>
            </svg>
          </div>
          <input
            id="signup-confirm-password"
            type="password"
            placeholder="비밀번호를 다시 입력해 주세요"
            autoComplete="new-password"
            className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[12px] pl-[45px] pr-[17px] py-[15px] text-white placeholder:text-[#6b7280] text-[16px] outline-none focus:border-[rgba(59,130,246,0.5)] focus:bg-[rgba(59,130,246,0.03)] transition-colors"
            onFocus={() => setFocusedPasswordField('confirmPassword')}
            onBlur={(e) => { void confirmOnBlur(e); setFocusedPasswordField(null) }}
            {...confirmRest}
          />
        </div>
        {isCapsLockOn && focusedPasswordField === 'confirmPassword' && (
          <p className="text-xs text-amber-400">⚠ Caps Lock이 켜져 있습니다</p>
        )}
        {errors.confirmPassword && <p className="text-[12px] text-red-400">{errors.confirmPassword.message}</p>}
      </div>

      {/* 회원가입 버튼 */}
      <button
        type="submit"
        disabled={isSubmitting || nicknameStatus === 'checking'}
        className="w-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white font-bold text-[16px] py-[14px] rounded-[12px] shadow-[0px_10px_15px_-3px_rgba(59,130,246,0.25),0px_4px_6px_-4px_rgba(59,130,246,0.25)] hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer mt-2"
      >
        {isSubmitting ? '처리 중...' : '회원가입'}
      </button>

      {/* 로그인 링크 */}
      <p className="text-center text-[14px] text-[#9ca3af]">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="text-[#3b82f6] font-medium hover:text-[#60a5fa] transition-colors">
          로그인
        </Link>
      </p>
    </form>
  )
}

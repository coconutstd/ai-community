'use client'

import { useState, useEffect, useCallback } from 'react'
import { useCapsLock } from '@/hooks/useCapsLock'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { signupSchema, type SignupFormValues } from '@/lib/validations/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
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

  // nickname 중복 체크 (debounce 300ms)
  const checkNickname = useCallback(
    async (nickname: string) => {
      const trimmed = nickname.trim()
      // Zod 유효성을 통과할 수 있는 길이인지 먼저 확인
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
    // 닉네임 중복 체크가 아직 완료되지 않은 경우 재확인
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
        <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          이메일을 확인해 주세요
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          인증 링크를 이메일로 발송했습니다.
          <br />
          받은 편지함에서 링크를 클릭하면 가입이 완료됩니다.
        </p>
        <p className="text-xs text-gray-400">
          이메일이 오지 않으면 스팸 폴더를 확인해 주세요.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
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
    nicknameStatus === 'available' ? 'text-green-600' : 'text-gray-500'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <Input
        label="이메일"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <div className="space-y-1.5">
        <Input
          label="닉네임"
          type="text"
          placeholder="2~20자 (한글, 영문, 숫자)"
          autoComplete="nickname"
          error={errors.nickname?.message}
          {...register('nickname')}
        />
        {!errors.nickname && nicknameHelperText && (
          <p className={`text-xs ${nicknameHelperClass}`}>
            {nicknameHelperText}
          </p>
        )}
      </div>

      <div>
        <Input
          label="비밀번호"
          type="password"
          placeholder="8자 이상 (영문, 숫자, 특수문자 포함)"
          autoComplete="new-password"
          error={errors.password?.message}
          onFocus={() => setFocusedPasswordField('password')}
          onBlur={(e) => { void pwOnBlur(e); setFocusedPasswordField(null) }}
          {...pwRest}
        />
        {isCapsLockOn && focusedPasswordField === 'password' && (
          <p className="mt-1.5 text-xs text-amber-600">
            ⚠ Caps Lock이 켜져 있습니다
          </p>
        )}
      </div>

      <div>
        <Input
          label="비밀번호 확인"
          type="password"
          placeholder="비밀번호를 다시 입력해 주세요"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          onFocus={() => setFocusedPasswordField('confirmPassword')}
          onBlur={(e) => { void confirmOnBlur(e); setFocusedPasswordField(null) }}
          {...confirmRest}
        />
        {isCapsLockOn && focusedPasswordField === 'confirmPassword' && (
          <p className="mt-1.5 text-xs text-amber-600">
            ⚠ Caps Lock이 켜져 있습니다
          </p>
        )}
      </div>

      <Button
        type="submit"
        fullWidth
        isLoading={isSubmitting}
        disabled={nicknameStatus === 'checking'}
      >
        회원가입
      </Button>

      <p className="text-center text-sm text-gray-600">
        이미 계정이 있으신가요?{' '}
        <Link
          href="/login"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          로그인
        </Link>
      </p>
    </form>
  )
}

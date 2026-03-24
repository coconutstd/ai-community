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
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
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
        // 잠금 상태이므로 로그아웃
        await supabase.auth.signOut()
        return
      }
    }

    // 스토어 업데이트
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {formError && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
        >
          {formError}
        </div>
      )}

      <Input
        label="이메일"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <div>
        <Input
          label="비밀번호"
          type="password"
          placeholder="비밀번호를 입력해 주세요"
          autoComplete="current-password"
          error={errors.password?.message}
          onFocus={() => setIsPasswordFocused(true)}
          onBlur={(e) => { void pwOnBlur(e); setIsPasswordFocused(false) }}
          {...pwRest}
        />
        {isCapsLockOn && isPasswordFocused && (
          <p className="mt-1.5 text-xs text-amber-600">
            ⚠ Caps Lock이 켜져 있습니다
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">로그인 상태 유지</span>
        </label>
        <Link
          href="/forgot-password"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          비밀번호 찾기
        </Link>
      </div>

      <Button type="submit" fullWidth isLoading={isSubmitting}>
        로그인
      </Button>

      <p className="text-center text-sm text-gray-600">
        계정이 없으신가요?{' '}
        <Link
          href="/signup"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          회원가입
        </Link>
      </p>
    </form>
  )
}

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/lib/validations/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'

export function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    const supabase = createClient()
    const origin = window.location.origin

    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${origin}/api/auth/callback?next=/reset-password`,
    })

    if (error) {
      if (error.message.includes('rate limit')) {
        toast.error('잠시 후 다시 시도해 주세요.')
      } else {
        toast.error('오류가 발생했습니다. 다시 시도해 주세요.')
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
          비밀번호 재설정 링크를 이메일로 발송했습니다.
          <br />
          받은 편지함에서 링크를 클릭해 주세요.
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <p className="text-sm text-gray-600">
        가입한 이메일 주소를 입력하면 비밀번호 재설정 링크를 보내드립니다.
      </p>

      <Input
        label="이메일"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <Button type="submit" fullWidth isLoading={isSubmitting}>
        재설정 링크 발송
      </Button>

      <p className="text-center text-sm text-gray-600">
        <Link
          href="/login"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          로그인으로 돌아가기
        </Link>
      </p>
    </form>
  )
}

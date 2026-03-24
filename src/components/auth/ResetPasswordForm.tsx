'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/lib/validations/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function ResetPasswordForm() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (values: ResetPasswordFormValues) => {
    const supabase = createClient()

    const { error } = await supabase.auth.updateUser({
      password: values.password,
    })

    if (error) {
      if (error.message.includes('same password')) {
        toast.error('기존 비밀번호와 동일한 비밀번호는 사용할 수 없습니다.')
      } else {
        toast.error('비밀번호 변경 중 오류가 발생했습니다. 다시 시도해 주세요.')
      }
      return
    }

    toast.success('비밀번호가 변경되었습니다. 다시 로그인해 주세요.')
    router.push('/login')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <Input
        label="새 비밀번호"
        type="password"
        placeholder="8자 이상 (영문, 숫자, 특수문자 포함)"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <Input
        label="새 비밀번호 확인"
        type="password"
        placeholder="새 비밀번호를 다시 입력해 주세요"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Button type="submit" fullWidth isLoading={isSubmitting}>
        비밀번호 변경
      </Button>
    </form>
  )
}

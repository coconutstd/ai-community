'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import dynamic from 'next/dynamic'

const PostEditor = dynamic(() => import('./PostEditor').then((mod) => mod.PostEditor), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
})
import { createPost, updatePost } from '@/app/actions/posts'
import {
  CATEGORY_TOOL_OPTIONS,
  CATEGORY_TASK_OPTIONS,
  type CategoryToolValue,
  type CategoryTaskValue,
} from '@/lib/constants/categories'
import { cn } from '@/lib/utils'

const schema = z.object({
  title: z
    .string()
    .min(2, '제목은 2자 이상이어야 합니다.')
    .max(100, '제목은 100자 이하이어야 합니다.'),
  category_tool: z.string().nullable().optional(),
  category_task: z.string().nullable().optional(),
  content: z.string().min(10, '본문은 10자 이상이어야 합니다.'),
})

type FormValues = z.infer<typeof schema>

interface PostFormProps {
  initialData?: {
    id?: number
    title: string
    content: string
    category_tool?: string | null
    category_task?: string | null
  }
}

export default function PostForm({ initialData }: PostFormProps) {
  const router = useRouter()
  const [mediaIds, setMediaIds] = useState<string[]>([])

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title ?? '',
      category_tool: initialData?.category_tool ?? null,
      category_task: initialData?.category_task ?? null,
      content: initialData?.content ?? '',
    },
  })

  const handleMediaUpload = (mediaId: string) => {
    setMediaIds((prev) => [...prev, mediaId])
  }

  const onSubmit = async (values: FormValues) => {
    try {
      if (initialData?.id) {
        const result = await updatePost(initialData.id, {
          title: values.title,
          content: values.content,
          category_tool: values.category_tool as CategoryToolValue | null | undefined,
          category_task: values.category_task as CategoryTaskValue | null | undefined,
        })

        if ('error' in result && result.error) {
          toast.error(result.error)
          return
        }

        router.push(`/posts/${initialData.id}`)
      } else {
        const result = await createPost({
          title: values.title,
          content: values.content,
          category_tool: values.category_tool as CategoryToolValue | null | undefined,
          category_task: values.category_task as CategoryTaskValue | null | undefined,
          mediaIds,
        })

        if ('error' in result) {
          toast.error(result.error)
          return
        }

        router.push(`/posts/${result.postId}`)
      }
    } catch {
      toast.error('오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* 제목 */}
      <Input
        label="제목"
        placeholder="제목을 입력하세요"
        error={errors.title?.message}
        {...register('title')}
      />

      {/* 카테고리 선택 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="category_tool"
            className="text-sm font-medium text-gray-700"
          >
            AI 툴
          </label>
          <select
            id="category_tool"
            className={cn(
              'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'transition-colors duration-150'
            )}
            {...register('category_tool')}
          >
            <option value="">선택 안함</option>
            {CATEGORY_TOOL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="category_task"
            className="text-sm font-medium text-gray-700"
          >
            업무 유형
          </label>
          <select
            id="category_task"
            className={cn(
              'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'transition-colors duration-150'
            )}
            {...register('category_task')}
          >
            <option value="">선택 안함</option>
            {CATEGORY_TASK_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 에디터 */}
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-gray-700">본문</span>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <PostEditor
              initialContent={initialData?.content}
              onChange={field.onChange}
              onMediaUpload={handleMediaUpload}
            />
          )}
        />
        {errors.content && (
          <p role="alert" className="text-xs text-red-500">
            {errors.content.message}
          </p>
        )}
      </div>

      {/* 제출 버튼 */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          취소
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {initialData?.id ? '수정 완료' : '게시하기'}
        </Button>
      </div>
    </form>
  )
}

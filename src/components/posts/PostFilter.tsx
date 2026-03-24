'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  CATEGORY_TOOL_OPTIONS,
  CATEGORY_TASK_OPTIONS,
} from '@/lib/constants/categories'

export function PostFilter() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const selectedTool = searchParams.get('category_tool')
  const selectedTask = searchParams.get('category_task')

  const handleToggle = (key: 'category_tool' | 'category_task', value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const current = params.get(key)

    if (current === value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="mb-6 space-y-3">
      <div>
        <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
          AI 툴
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_TOOL_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleToggle('category_tool', option.value)}
              className={cn(
                'rounded-full px-3 py-1 text-sm font-medium transition-colors',
                selectedTool === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
              aria-pressed={selectedTool === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
          업무 유형
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_TASK_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleToggle('category_task', option.value)}
              className={cn(
                'rounded-full px-3 py-1 text-sm font-medium transition-colors',
                selectedTask === option.value
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
              aria-pressed={selectedTask === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

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
    <div className="mb-8 backdrop-blur-[8px] bg-[rgba(15,23,42,0.4)] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-6 space-y-4">
      <div>
        <p className="mb-3 text-[12px] font-semibold text-[#94a3b8] uppercase tracking-widest">
          AI 툴
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_TOOL_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleToggle('category_tool', option.value)}
              className={cn(
                'rounded-full px-4 py-[6px] text-[13px] font-medium transition-all',
                selectedTool === option.value
                  ? 'bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white shadow-[0px_4px_12px_rgba(59,130,246,0.3)]'
                  : 'bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.12)]'
              )}
              aria-pressed={selectedTool === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-[12px] font-semibold text-[#94a3b8] uppercase tracking-widest">
          업무 유형
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_TASK_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleToggle('category_task', option.value)}
              className={cn(
                'rounded-full px-4 py-[6px] text-[13px] font-medium transition-all',
                selectedTask === option.value
                  ? 'bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white shadow-[0px_4px_12px_rgba(59,130,246,0.3)]'
                  : 'bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.12)]'
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

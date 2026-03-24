import type { Enums } from '@/types/database'

export const CATEGORY_TOOL_OPTIONS: {
  value: Enums<'category_tool_type'>
  label: string
}[] = [
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'claude', label: 'Claude' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'midjourney', label: 'Midjourney' },
  { value: 'stable_diffusion', label: 'Stable Diffusion' },
  { value: 'copilot', label: 'Copilot' },
  { value: 'cursor', label: 'Cursor' },
  { value: 'other', label: '기타 툴' },
] as const

export const CATEGORY_TASK_OPTIONS: {
  value: Enums<'category_task_type'>
  label: string
}[] = [
  { value: 'writing', label: '글쓰기' },
  { value: 'coding', label: '코딩' },
  { value: 'image', label: '이미지' },
  { value: 'video', label: '영상' },
  { value: 'audio', label: '음성' },
  { value: 'data_analysis', label: '데이터 분석' },
  { value: 'research', label: '리서치' },
  { value: 'productivity', label: '생산성' },
  { value: 'other', label: '기타 업무' },
] as const

export type CategoryToolValue = Enums<'category_tool_type'>
export type CategoryTaskValue = Enums<'category_task_type'>

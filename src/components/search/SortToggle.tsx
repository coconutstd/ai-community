'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { SearchSortOption } from '@/hooks/useSearch'

interface SortToggleProps {
  currentSort: SearchSortOption
  query: string
}

export function SortToggle({ currentSort, query }: SortToggleProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSort = (sort: SearchSortOption) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('q', query)
    params.set('sort', sort)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-1" role="group" aria-label="정렬 기준">
      <button
        type="button"
        onClick={() => handleSort('relevance')}
        aria-pressed={currentSort === 'relevance'}
        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
          currentSort === 'relevance'
            ? 'bg-blue-600 text-white font-medium'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        관련도순
      </button>
      <button
        type="button"
        onClick={() => handleSort('latest')}
        aria-pressed={currentSort === 'latest'}
        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
          currentSort === 'latest'
            ? 'bg-blue-600 text-white font-medium'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        최신순
      </button>
    </div>
  )
}

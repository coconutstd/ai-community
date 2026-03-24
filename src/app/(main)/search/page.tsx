import { Suspense } from 'react'
import type { Metadata } from 'next'
import { SearchResultList } from '@/components/posts/SearchResultList'
import { PostCardSkeleton } from '@/components/posts/PostCardSkeleton'
import { SortToggle } from '@/components/search/SortToggle'
import type { SearchSortOption } from '@/hooks/useSearch'

interface SearchPageProps {
  searchParams: Promise<{ q?: string; sort?: string }>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `"${q}" 검색 결과 | AI 커뮤니티` : '검색 | AI 커뮤니티',
    description: q ? `"${q}"에 대한 AI 커뮤니티 검색 결과입니다.` : 'AI 커뮤니티 검색',
  }
}

function SearchResultSkeleton() {
  return (
    <div className="space-y-4" aria-label="검색 결과 불러오는 중">
      <PostCardSkeleton />
      <PostCardSkeleton />
      <PostCardSkeleton />
    </div>
  )
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, sort } = await searchParams
  const query = q?.trim() ?? ''
  const currentSort: SearchSortOption =
    sort === 'latest' ? 'latest' : 'relevance'

  if (!query) {
    return (
      <section>
        <h1 className="text-xl font-bold text-gray-900 mb-6">검색</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-gray-500 text-sm">검색어를 입력해주세요.</p>
        </div>
      </section>
    )
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl font-bold text-gray-900">
          <span className="text-blue-600">&ldquo;{query}&rdquo;</span> 검색 결과
        </h1>
        <Suspense>
          <SortToggle currentSort={currentSort} query={query} />
        </Suspense>
      </div>

      <Suspense key={`${query}-${currentSort}`} fallback={<SearchResultSkeleton />}>
        <SearchResultList query={query} sort={currentSort} />
      </Suspense>
    </section>
  )
}

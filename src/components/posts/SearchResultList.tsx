'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useSearch, type SearchSortOption } from '@/hooks/useSearch'
import { SearchResultCard } from './SearchResultCard'
import { PostCardSkeleton } from './PostCardSkeleton'
import { EmptyState } from '@/components/ui/EmptyState'

interface SearchResultListProps {
  query: string
  sort: SearchSortOption
}

export function SearchResultList({ query, sort }: SearchResultListProps) {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
    error,
  } = useSearch({ query, sort })

  const observerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isError && error) {
      toast.error('검색 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.')
    }
  }, [isError, error])

  useEffect(() => {
    const el = observerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '100px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading) {
    return (
      <div className="space-y-4" aria-label="검색 결과 불러오는 중">
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <EmptyState
        title="검색 결과를 불러오지 못했어요"
        description="잠시 후 다시 시도해주세요."
      />
    )
  }

  const posts = data?.pages.flatMap((page) => page) ?? []

  if (posts.length === 0) {
    return (
      <EmptyState
        title={`"${query}"에 대한 검색 결과가 없어요`}
        description="다른 키워드로 검색해보세요."
      />
    )
  }

  return (
    <div>
      <ul className="space-y-4" aria-label={`"${query}" 검색 결과`}>
        {posts.map((post) => (
          <li key={post.id}>
            <SearchResultCard post={post} />
          </li>
        ))}
      </ul>

      {isFetchingNextPage && (
        <div className="mt-4 space-y-4" aria-label="추가 검색 결과 불러오는 중">
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      )}

      <div ref={observerRef} className="h-1" aria-hidden="true" />
    </div>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import { usePosts } from '@/hooks/usePosts'
import { PostCard } from './PostCard'
import { PostCardSkeleton } from './PostCardSkeleton'
import { EmptyState } from '@/components/ui/EmptyState'

interface PostListProps {
  category_tool?: string
  category_task?: string
}

export function PostList({ category_tool, category_task }: PostListProps) {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
  } = usePosts({ category_tool, category_task })

  const observerRef = useRef<HTMLDivElement>(null)

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
      <div className="space-y-4" aria-label="게시글 불러오는 중">
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <EmptyState
        title="게시글을 불러오지 못했어요"
        description="잠시 후 다시 시도해주세요."
      />
    )
  }

  const posts = data?.pages.flatMap((page) => page) ?? []

  if (posts.length === 0) {
    return (
      <EmptyState
        title="아직 게시글이 없어요"
        description="첫 번째 글을 작성해보세요!"
      />
    )
  }

  return (
    <div>
      <ul className="space-y-4" aria-label="게시글 목록">
        {posts.map((post) => (
          <li key={post.id}>
            <PostCard post={post} />
          </li>
        ))}
      </ul>

      {isFetchingNextPage && (
        <div className="mt-4 space-y-4" aria-label="추가 게시글 불러오는 중">
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      )}

      <div ref={observerRef} className="h-1" aria-hidden="true" />
    </div>
  )
}

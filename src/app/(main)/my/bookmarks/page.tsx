import { Suspense } from 'react'
import type { Metadata } from 'next'
import { MyBookmarkList } from '@/components/posts/MyBookmarkList'
import { PostCardSkeleton } from '@/components/posts/PostCardSkeleton'

export const metadata: Metadata = {
  title: '북마크 | AI 커뮤니티',
  description: '북마크한 게시글 목록입니다.',
}

function MyBookmarkListSkeleton() {
  return (
    <div className="space-y-4" aria-label="북마크 불러오는 중">
      <PostCardSkeleton />
      <PostCardSkeleton />
      <PostCardSkeleton />
    </div>
  )
}

export default function MyBookmarksPage() {
  return (
    <section>
      <h1 className="text-xl font-bold text-gray-900 mb-6">북마크</h1>
      <Suspense fallback={<MyBookmarkListSkeleton />}>
        <MyBookmarkList />
      </Suspense>
    </section>
  )
}

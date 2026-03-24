import { Suspense } from 'react'
import type { Metadata } from 'next'
import { MyPostList } from '@/components/posts/MyPostList'
import { PostCardSkeleton } from '@/components/posts/PostCardSkeleton'

export const metadata: Metadata = {
  title: '내가 쓴 글 | AI 커뮤니티',
  description: '내가 작성한 게시글 목록입니다.',
}

function MyPostListSkeleton() {
  return (
    <div className="space-y-4" aria-label="게시글 불러오는 중">
      <PostCardSkeleton />
      <PostCardSkeleton />
      <PostCardSkeleton />
    </div>
  )
}

export default function MyPostsPage() {
  return (
    <section>
      <h1 className="text-xl font-bold text-gray-900 mb-6">내가 쓴 글</h1>
      <Suspense fallback={<MyPostListSkeleton />}>
        <MyPostList />
      </Suspense>
    </section>
  )
}

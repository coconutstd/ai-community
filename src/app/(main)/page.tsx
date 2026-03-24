import { Suspense } from 'react'
import { PostFilter } from '@/components/posts/PostFilter'
import { PostList } from '@/components/posts/PostList'
import { PostCardSkeleton } from '@/components/posts/PostCardSkeleton'

interface HomePageProps {
  searchParams: Promise<{ category_tool?: string; category_task?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { category_tool, category_task } = await searchParams

  return (
    <div>
      <Suspense fallback={null}>
        <PostFilter />
      </Suspense>
      <Suspense
        fallback={
          <div className="space-y-4">
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        }
      >
        <PostList category_tool={category_tool} category_task={category_task} />
      </Suspense>
    </div>
  )
}

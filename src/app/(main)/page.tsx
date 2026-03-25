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
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[30px] font-bold text-white leading-[36px] mb-2">
            최신 AI 활용 팁
          </h1>
          <p className="text-[#94a3b8] text-[14px]">
            동료들이 공유한 유용한 AI 활용 사례를 확인해보세요.
          </p>
        </div>
      </div>

      <Suspense fallback={null}>
        <PostFilter />
      </Suspense>
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <PostCardSkeleton />
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

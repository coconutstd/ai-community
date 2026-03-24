import { Skeleton } from '@/components/ui/Skeleton'

export function PostCardSkeleton() {
  return (
    <div
      className="border rounded-lg p-4 bg-white"
      aria-hidden="true"
      role="presentation"
    >
      {/* 카테고리 뱃지 */}
      <div className="flex items-center gap-2 mb-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      {/* 제목 */}
      <Skeleton className="h-5 w-3/4 mb-2" />
      {/* 본문 미리보기 */}
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-5/6 mb-3" />
      {/* 메타 정보 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  )
}

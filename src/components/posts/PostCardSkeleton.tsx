import { Skeleton } from '@/components/ui/Skeleton'

export function PostCardSkeleton() {
  return (
    <div
      className="bg-[#0f172a] border border-[rgba(255,255,255,0.1)] rounded-[16px] overflow-hidden"
      aria-hidden="true"
      role="presentation"
    >
      {/* 썸네일 */}
      <Skeleton className="h-[192px] w-full rounded-none bg-[#1e293b]" />
      {/* 본문 */}
      <div className="p-5">
        {/* 작성자 */}
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-7 w-7 rounded-full bg-[#1e293b]" />
          <Skeleton className="h-3 w-20 bg-[#1e293b]" />
          <Skeleton className="h-3 w-14 ml-auto bg-[#1e293b]" />
        </div>
        {/* 제목 */}
        <Skeleton className="h-4 w-full mb-2 bg-[#1e293b]" />
        <Skeleton className="h-4 w-3/4 mb-3 bg-[#1e293b]" />
        {/* 본문 */}
        <Skeleton className="h-3 w-full mb-1 bg-[#1e293b]" />
        <Skeleton className="h-3 w-5/6 mb-1 bg-[#1e293b]" />
        <Skeleton className="h-3 w-4/6 mb-4 bg-[#1e293b]" />
        {/* 통계 */}
        <div className="flex items-center gap-4 pt-3 border-t border-[rgba(255,255,255,0.06)]">
          <Skeleton className="h-3 w-10 bg-[#1e293b]" />
          <Skeleton className="h-3 w-10 bg-[#1e293b]" />
          <Skeleton className="h-3 w-10 ml-auto bg-[#1e293b]" />
        </div>
      </div>
    </div>
  )
}

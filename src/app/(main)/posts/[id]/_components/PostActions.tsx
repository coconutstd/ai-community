'use client'

import { useLike } from '@/hooks/useLike'
import { useBookmark } from '@/hooks/useBookmark'

interface PostActionsProps {
  postId: number
  initialIsLiked: boolean
  initialLikeCount: number
  initialIsBookmarked: boolean
  commentCount?: number
}

function HeartIcon({ filled }: { filled: boolean }) {
  return filled ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  )
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return filled ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  )
}

function CommentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
}

export function PostActions({
  postId,
  initialIsLiked,
  initialLikeCount,
  initialIsBookmarked,
  commentCount = 0,
}: PostActionsProps) {
  const { isLiked, likeCount, toggle: toggleLike } = useLike({ postId, initialIsLiked, initialLikeCount })
  const { isBookmarked, toggle: toggleBookmark, isPending: isBookmarkPending } = useBookmark({ postId, initialIsBookmarked })

  const scrollToComments = () => {
    document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })
  }

  const likeClass = isLiked
    ? 'bg-[rgba(239,68,68,0.12)] text-[#f87171] border border-[rgba(239,68,68,0.3)]'
    : 'bg-[rgba(255,255,255,0.06)] text-[#94a3b8] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)]'

  const bookmarkClass = isBookmarked
    ? 'bg-[rgba(59,130,246,0.12)] text-[#60a5fa] border border-[rgba(59,130,246,0.3)]'
    : 'bg-[rgba(255,255,255,0.06)] text-[#94a3b8] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)]'

  return (
    <>
      {/* Desktop: 본문 하단 인라인 행 */}
      <div className="hidden md:flex items-center gap-3 border-t border-[rgba(255,255,255,0.08)] pt-5 mt-2">
        <button
          onClick={toggleLike}
          aria-label={isLiked ? '좋아요 취소' : '좋아요'}
          aria-pressed={isLiked}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-[14px] font-medium transition-all ${likeClass}`}
        >
          <HeartIcon filled={isLiked} />
          <span>{likeCount.toLocaleString()}</span>
        </button>
        <button
          onClick={toggleBookmark}
          disabled={isBookmarkPending}
          aria-label={isBookmarked ? '북마크 해제' : '북마크'}
          aria-pressed={isBookmarked}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-[14px] font-medium transition-all disabled:opacity-50 ${bookmarkClass}`}
        >
          <BookmarkIcon filled={isBookmarked} />
          <span>{isBookmarked ? '북마크됨' : '북마크'}</span>
        </button>
      </div>

      {/* Mobile: 하단 고정 액션 바 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[rgba(5,11,20,0.96)] backdrop-blur-[12px] border-t border-[rgba(255,255,255,0.08)] px-6 pt-3 pb-5">
        <div className="flex items-center justify-around">
          <button
            onClick={toggleLike}
            aria-label={isLiked ? '좋아요 취소' : '좋아요'}
            className={`flex flex-col items-center gap-1 transition-colors ${isLiked ? 'text-[#f87171]' : 'text-[#64748b]'}`}
          >
            <HeartIcon filled={isLiked} />
            <span className="text-[11px]">{likeCount.toLocaleString()}</span>
          </button>
          <button
            onClick={scrollToComments}
            className="flex flex-col items-center gap-1 text-[#64748b]"
          >
            <CommentIcon />
            <span className="text-[11px]">{commentCount.toLocaleString()}</span>
          </button>
          <button
            onClick={toggleBookmark}
            disabled={isBookmarkPending}
            aria-label={isBookmarked ? '북마크 해제' : '북마크'}
            className={`flex flex-col items-center gap-1 transition-colors disabled:opacity-50 ${isBookmarked ? 'text-[#60a5fa]' : 'text-[#64748b]'}`}
          >
            <BookmarkIcon filled={isBookmarked} />
            <span className="text-[11px]">{isBookmarked ? '저장됨' : '저장'}</span>
          </button>
        </div>
      </div>
    </>
  )
}

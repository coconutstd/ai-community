'use client'

import { useBookmark } from '@/hooks/useBookmark'

interface BookmarkButtonProps {
  postId: number
  initialIsBookmarked: boolean
}

function OutlineBookmarkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
      />
    </svg>
  )
}

function FilledBookmarkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" />
    </svg>
  )
}

export function BookmarkButton({ postId, initialIsBookmarked }: BookmarkButtonProps) {
  const { isBookmarked, toggle, isPending } = useBookmark({ postId, initialIsBookmarked })

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      aria-label={isBookmarked ? '북마크 해제' : '북마크'}
      aria-pressed={isBookmarked}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        isPending ? 'opacity-50 cursor-not-allowed' : ''
      } ${
        isBookmarked
          ? 'bg-blue-50 text-blue-500 hover:bg-blue-100'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {isBookmarked ? <FilledBookmarkIcon /> : <OutlineBookmarkIcon />}
      <span>{isBookmarked ? '북마크됨' : '북마크'}</span>
    </button>
  )
}

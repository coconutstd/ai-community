'use client'

import { LikeButton } from './LikeButton'
import { BookmarkButton } from './BookmarkButton'

interface PostActionsProps {
  postId: number
  initialIsLiked: boolean
  initialLikeCount: number
  initialIsBookmarked: boolean
}

export function PostActions({
  postId,
  initialIsLiked,
  initialLikeCount,
  initialIsBookmarked,
}: PostActionsProps) {
  return (
    <div className="flex items-center justify-between border-t border-b border-gray-100 py-3 my-6">
      <LikeButton
        postId={postId}
        initialIsLiked={initialIsLiked}
        initialLikeCount={initialLikeCount}
      />
      <BookmarkButton postId={postId} initialIsBookmarked={initialIsBookmarked} />
    </div>
  )
}

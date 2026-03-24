'use client'

import Link from 'next/link'
import { formatRelativeDate } from '@/lib/utils/date'
import {
  CATEGORY_TOOL_OPTIONS,
  CATEGORY_TASK_OPTIONS,
} from '@/lib/constants/categories'
import type { PostWithAuthor } from '@/hooks/usePosts'

interface PostCardProps {
  post: PostWithAuthor
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

function getCategoryLabel(
  options: { value: string; label: string }[],
  value: string | null | undefined
): string | null {
  if (!value) return null
  return options.find((o) => o.value === value)?.label ?? null
}

export function PostCard({ post }: PostCardProps) {
  const toolLabel = getCategoryLabel(CATEGORY_TOOL_OPTIONS, post.category_tool)
  const taskLabel = getCategoryLabel(CATEGORY_TASK_OPTIONS, post.category_task)
  const excerpt = stripHtml(post.content).slice(0, 150)

  return (
    <Link
      href={`/posts/${post.id}`}
      className="block border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
    >
      <article>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {toolLabel && (
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              {toolLabel}
            </span>
          )}
          {taskLabel && (
            <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
              {taskLabel}
            </span>
          )}
        </div>

        <h2 className="text-base font-semibold text-gray-900 line-clamp-1 mb-1">
          {post.title}
        </h2>

        {excerpt && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{excerpt}</p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <span>{post.author?.nickname ?? '알 수 없음'}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.created_at}>
              {formatRelativeDate(post.created_at)}
            </time>
          </div>

          <div className="flex items-center gap-3" aria-label="게시글 통계">
            <span title="조회수">조회 {post.view_count.toLocaleString()}</span>
            <span title="좋아요">좋아요 {post.like_count.toLocaleString()}</span>
            <span title="댓글">댓글 {post.comment_count.toLocaleString()}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

import Link from 'next/link'
import { formatRelativeDate } from '@/lib/utils/date'
import {
  CATEGORY_TOOL_OPTIONS,
  CATEGORY_TASK_OPTIONS,
} from '@/lib/constants/categories'
import type { SearchResultPost } from '@/hooks/useSearch'

interface SearchResultCardProps {
  post: SearchResultPost
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

export function SearchResultCard({ post }: SearchResultCardProps) {
  const toolLabel = getCategoryLabel(CATEGORY_TOOL_OPTIONS, post.category_tool)
  const taskLabel = getCategoryLabel(CATEGORY_TASK_OPTIONS, post.category_task)

  // highlighted 값이 없으면 원본 fallback
  const displayTitle = post.highlighted_title ?? post.title
  const hasHighlightedTitle = !!post.highlighted_title

  const displayContent = post.highlighted_content
    ? post.highlighted_content
    : stripHtml(post.content).slice(0, 150)
  const hasHighlightedContent = !!post.highlighted_content

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
          {hasHighlightedTitle ? (
            <span
              dangerouslySetInnerHTML={{ __html: displayTitle }}
              className="[&_mark]:bg-yellow-200 [&_mark]:text-gray-900 [&_mark]:rounded-sm [&_mark]:px-0.5"
            />
          ) : (
            displayTitle
          )}
        </h2>

        {displayContent && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {hasHighlightedContent ? (
              <span
                dangerouslySetInnerHTML={{ __html: displayContent }}
                className="[&_mark]:bg-yellow-200 [&_mark]:text-gray-900 [&_mark]:rounded-sm [&_mark]:px-0.5"
              />
            ) : (
              displayContent
            )}
          </p>
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

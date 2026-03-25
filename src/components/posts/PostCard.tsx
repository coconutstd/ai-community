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
  const categoryLabel = toolLabel ?? taskLabel
  const excerpt = stripHtml(post.content).slice(0, 120)

  const avatarInitial = post.author?.nickname?.[0]?.toUpperCase() ?? 'U'

  return (
    <Link
      href={`/posts/${post.id}`}
      className="group block bg-[#0f172a] border border-[rgba(255,255,255,0.1)] rounded-[16px] overflow-hidden hover:border-[rgba(59,130,246,0.4)] hover:shadow-[0px_8px_32px_rgba(59,130,246,0.12)] transition-all"
    >
      <article>
        {/* 썸네일 */}
        <div className="relative h-[192px] bg-[#1e293b] overflow-hidden">
          <div
            className="absolute inset-0 opacity-30"
            style={{ backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.3">
              <path d="M24 4L44 16V32L24 44L4 32V16L24 4Z" fill="white" />
              <circle cx="24" cy="24" r="8" fill="white" />
            </svg>
          </div>

          {/* 카테고리 배지 */}
          {categoryLabel && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center rounded-full backdrop-blur-[8px] bg-[rgba(255,255,255,0.9)] px-3 py-1 text-[12px] font-semibold text-[#0f172a]">
                {categoryLabel}
              </span>
            </div>
          )}
        </div>

        {/* 본문 */}
        <div className="p-5">
          {/* 작성자 정보 */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center shrink-0 text-[11px] font-bold text-white overflow-hidden">
              {post.author?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.author.avatar_url} alt={post.author.nickname} className="w-full h-full object-cover" />
              ) : (
                avatarInitial
              )}
            </div>
            <span className="text-[13px] text-[#94a3b8] truncate">
              {post.author?.nickname ?? '알 수 없음'}
            </span>
            <span className="text-[#475569] text-[12px] ml-auto shrink-0">
              <time dateTime={post.created_at}>{formatRelativeDate(post.created_at)}</time>
            </span>
          </div>

          {/* 제목 */}
          <h2 className="text-[15px] font-bold text-white line-clamp-2 leading-snug mb-2 group-hover:text-[#93c5fd] transition-colors">
            {post.title}
          </h2>

          {/* 본문 요약 */}
          {excerpt && (
            <p className="text-[13px] text-[#64748b] line-clamp-3 leading-relaxed mb-4">
              {excerpt}
            </p>
          )}

          {/* 하단 통계 */}
          <div className="flex items-center gap-4 pt-3 border-t border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-1.5 text-[#64748b]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1.5C4 1.5 1.5 4 1.5 7s2.5 5.5 5.5 5.5S12.5 10 12.5 7 10 1.5 7 1.5Z" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M4.5 7.5c.5 1 1.4 1.5 2.5 1.5s2-.5 2.5-1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <circle cx="5" cy="5.5" r="0.8" fill="currentColor"/>
                <circle cx="9" cy="5.5" r="0.8" fill="currentColor"/>
              </svg>
              <span className="text-[12px]">{post.like_count.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#64748b]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2h10a1 1 0 011 1v6a1 1 0 01-1 1H4l-3 2V3a1 1 0 011-1Z" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              <span className="text-[12px]">{post.comment_count.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#64748b] ml-auto">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1.5 7C1.5 7 3.5 3 7 3s5.5 4 5.5 4-2 4-5.5 4-5.5-4-5.5-4Z" stroke="currentColor" strokeWidth="1.2"/>
                <circle cx="7" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              <span className="text-[12px]">{post.view_count.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatRelativeDate } from '@/lib/utils/date'
import {
  CATEGORY_TOOL_OPTIONS,
  CATEGORY_TASK_OPTIONS,
} from '@/lib/constants/categories'
import { Button } from '@/components/ui/Button'
import { ViewCounter } from './_components/ViewCounter'
import { DeleteButton } from './_components/DeleteButton'
import { PostActions } from './_components/PostActions'
import { CommentList } from './_components/CommentList'

interface PostDetailPageProps {
  params: Promise<{ id: string }>
}

function getCategoryLabel(
  options: { value: string; label: string }[],
  value: string | null | undefined
): string | null {
  if (!value) return null
  return options.find((o) => o.value === value)?.label ?? null
}

export async function generateMetadata({ params }: PostDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('posts')
    .select('title, content')
    .eq('id', parseInt(id, 10))
    .eq('is_deleted', false)
    .single()

  if (!post) return { title: '게시글을 찾을 수 없습니다.' }

  return {
    title: post.title,
    description: post.content.replace(/<[^>]*>/g, '').slice(0, 150),
    openGraph: {
      title: post.title,
      description: post.content.replace(/<[^>]*>/g, '').slice(0, 150),
      type: 'article',
      url: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/posts/${id}`,
    },
  }
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params
  const postId = parseInt(id, 10)

  if (isNaN(postId)) notFound()

  const supabase = await createClient()

  const [{ data: post }, { data: { user } }] = await Promise.all([
    supabase
      .from('posts')
      .select('*, author:users!posts_author_id_fkey(nickname, avatar_url)')
      .eq('id', postId)
      .eq('is_deleted', false)
      .single(),
    supabase.auth.getUser(),
  ])

  if (!post) notFound()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.is_admin ?? false
  }

  let initialIsLiked = false
  let initialIsBookmarked = false
  if (user) {
    const [{ data: like }, { data: bookmark }] = await Promise.all([
      supabase
        .from('likes')
        .select('post_id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('bookmarks')
        .select('post_id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle(),
    ])
    initialIsLiked = !!like
    initialIsBookmarked = !!bookmark
  }

  const isAuthor = user?.id === post.author_id
  const canEdit = isAuthor
  const canDelete = isAuthor || isAdmin

  const toolLabel = getCategoryLabel(CATEGORY_TOOL_OPTIONS, post.category_tool)
  const taskLabel = getCategoryLabel(CATEGORY_TASK_OPTIONS, post.category_task)

  const author = Array.isArray(post.author) ? post.author[0] : post.author
  const avatarInitial = author?.nickname?.[0]?.toUpperCase() ?? 'U'

  return (
    <article className="pb-24 md:pb-0">
      <ViewCounter postId={postId} />

      {/* 모바일 뒤로가기 헤더 */}
      <div className="md:hidden flex items-center justify-between mb-5">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[14px] text-[#94a3b8] hover:text-white transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          뒤로
        </Link>
      </div>

      {/* 브레드크럼 (데스크탑) */}
      <nav className="hidden md:flex items-center gap-2 text-[13px] text-[#475569] mb-6" aria-label="breadcrumb">
        <Link href="/" className="hover:text-white transition-colors">홈</Link>
        <span>›</span>
        <span className="text-[#94a3b8]">AI 활용 팁</span>
        <span>›</span>
        <span className="text-white truncate max-w-[240px]">{post.title}</span>
      </nav>

      {/* 메인 카드 */}
      <div className="backdrop-blur-[8px] bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] rounded-[16px] overflow-hidden mb-6">
        {/* 카드 헤더 */}
        <header className="px-6 md:px-8 pt-6 md:pt-8 pb-6 border-b border-[rgba(255,255,255,0.08)]">
          {/* 카테고리 배지 */}
          {(toolLabel || taskLabel) && (
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {toolLabel && (
                <span className="inline-flex items-center rounded-full bg-[rgba(59,130,246,0.15)] px-3 py-1 text-[12px] font-medium text-[#60a5fa]">
                  {toolLabel}
                </span>
              )}
              {taskLabel && (
                <span className="inline-flex items-center rounded-full bg-[rgba(16,185,129,0.12)] px-3 py-1 text-[12px] font-medium text-[#34d399]">
                  {taskLabel}
                </span>
              )}
            </div>
          )}

          {/* 제목 */}
          <h1 className="text-[20px] md:text-[26px] font-bold text-white leading-snug mb-5">
            {post.title}
          </h1>

          {/* 작성자 + 통계 */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center text-[13px] font-bold text-white overflow-hidden shrink-0">
                {author?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={author.avatar_url} alt={author.nickname} className="w-full h-full object-cover" />
                ) : (
                  avatarInitial
                )}
              </div>
              <div>
                <p className="text-[14px] font-medium text-white leading-tight">
                  {author?.nickname ?? '알 수 없음'}
                </p>
                <div className="flex items-center gap-1.5 text-[12px] text-[#475569]">
                  <time dateTime={post.created_at}>{formatRelativeDate(post.created_at)}</time>
                  {post.updated_at !== post.created_at && (
                    <span className="text-[#374151]">(수정됨)</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[13px] text-[#475569]">
              <span>조회 {post.view_count.toLocaleString()}</span>
              <span>좋아요 {post.like_count.toLocaleString()}</span>
              <span>댓글 {post.comment_count.toLocaleString()}</span>
            </div>
          </div>
        </header>

        {/* 본문 */}
        <div className="px-6 md:px-8 py-6 md:py-8">
          <div
            className="prose max-w-none min-h-[200px] text-[#e2e8f0]"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* 데스크탑 좋아요/북마크 (본문 하단) */}
          <Suspense fallback={null}>
            <PostActions
              postId={postId}
              initialIsLiked={initialIsLiked}
              initialLikeCount={post.like_count}
              initialIsBookmarked={initialIsBookmarked}
              commentCount={post.comment_count}
            />
          </Suspense>
        </div>
      </div>

      {/* 댓글 카드 */}
      <div className="backdrop-blur-[8px] bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] rounded-[16px] px-6 md:px-8 py-6 md:py-8 mb-6">
        <Suspense
          fallback={
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-[#1e293b] animate-pulse rounded-[12px]" />
              ))}
            </div>
          }
        >
          <CommentList postId={postId} currentUserId={user?.id ?? null} />
        </Suspense>
      </div>

      {/* 수정/삭제 버튼 */}
      {(canEdit || canDelete) && (
        <div className="flex justify-end gap-2 mb-6">
          {canEdit && (
            <Link href={`/posts/${postId}/edit`}>
              <Button variant="secondary" size="sm">수정</Button>
            </Link>
          )}
          {canDelete && <DeleteButton postId={postId} />}
        </div>
      )}
    </article>
  )
}

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

  // 현재 사용자 프로필 (관리자 여부 확인용)
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

  // author 타입 처리 (Supabase JOIN은 배열 또는 객체로 올 수 있음)
  const author = Array.isArray(post.author) ? post.author[0] : post.author

  return (
    <article>
      <ViewCounter postId={postId} />

      {/* 헤더 */}
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
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

        <h1 className="text-2xl font-bold text-gray-900 mb-3">{post.title}</h1>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium text-gray-700">
              {author?.nickname ?? '알 수 없음'}
            </span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.created_at}>
              {formatRelativeDate(post.created_at)}
            </time>
            {post.updated_at !== post.created_at && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-gray-400">(수정됨)</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>조회 {post.view_count.toLocaleString()}</span>
            <span>좋아요 {post.like_count.toLocaleString()}</span>
            <span>댓글 {post.comment_count.toLocaleString()}</span>
          </div>
        </div>
      </header>

      {/* 본문 */}
      <div
        className="prose max-w-none mb-8 min-h-[200px]"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* 좋아요 / 북마크 */}
      <Suspense fallback={null}>
        <PostActions
          postId={postId}
          initialIsLiked={initialIsLiked}
          initialLikeCount={post.like_count}
          initialIsBookmarked={initialIsBookmarked}
        />
      </Suspense>

      {/* 댓글 */}
      <Suspense
        fallback={
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />
            ))}
          </div>
        }
      >
        <CommentList postId={postId} currentUserId={user?.id ?? null} />
      </Suspense>

      {/* 작성자 액션 버튼 */}
      {(canEdit || canDelete) && (
        <div className="flex justify-end gap-2 border-t pt-4">
          {canEdit && (
            <Link href={`/posts/${postId}/edit`}>
              <Button variant="secondary" size="sm">
                수정
              </Button>
            </Link>
          )}
          {canDelete && <DeleteButton postId={postId} />}
        </div>
      )}
    </article>
  )
}

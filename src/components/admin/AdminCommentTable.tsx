import Link from 'next/link'
import { AdminDeleteButton } from './AdminDeleteButton'

interface AdminCommentTableProps {
  comments: Array<{
    id: number
    content: string
    is_deleted: boolean
    deleted_at: string | null
    created_at: string
    author_id: string
    post_id: number
    author: { nickname: string } | null
    post: { title: string } | null
  }>
  currentPage: number
  totalPages: number
}

export function AdminCommentTable({ comments, currentPage, totalPages }: AdminCommentTableProps) {
  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500 w-16">ID</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">내용</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 w-28">작성자</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 w-48">게시글</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 w-36">작성일</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500 w-20">상태</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500 w-20">삭제</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {comments.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  댓글이 없습니다.
                </td>
              </tr>
            )}
            {comments.map((comment) => (
              <tr
                key={comment.id}
                className={comment.is_deleted ? 'bg-red-50' : 'hover:bg-gray-50'}
              >
                <td className="px-4 py-3 text-gray-500 tabular-nums">{comment.id}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      comment.is_deleted ? 'text-gray-400 line-through' : 'text-gray-900'
                    }
                    title={comment.content}
                  >
                    {comment.content.length > 50
                      ? comment.content.slice(0, 50) + '…'
                      : comment.content}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{comment.author?.nickname ?? '-'}</td>
                <td className="px-4 py-3 text-gray-600">
                  <Link
                    href={`/posts/${comment.post_id}`}
                    className="hover:text-blue-600 hover:underline transition-colors"
                    title={comment.post?.title ?? ''}
                  >
                    {comment.post
                      ? comment.post.title.length > 30
                        ? comment.post.title.slice(0, 30) + '…'
                        : comment.post.title
                      : '-'}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-500 tabular-nums whitespace-nowrap">
                  {new Date(comment.created_at).toLocaleDateString('ko-KR')}
                </td>
                <td className="px-4 py-3 text-center">
                  {comment.is_deleted ? (
                    <span className="inline-block px-2 py-0.5 rounded text-xs bg-red-100 text-red-600">
                      삭제됨
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 rounded text-xs bg-green-100 text-green-600">
                      정상
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <AdminDeleteButton
                    type="comment"
                    id={comment.id}
                    isDeleted={comment.is_deleted}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {currentPage > 1 && (
            <Link
              href={`?page=${currentPage - 1}`}
              className="px-3 py-1.5 text-sm rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              이전
            </Link>
          )}
          <span className="text-sm text-gray-500 px-2">
            {currentPage} / {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link
              href={`?page=${currentPage + 1}`}
              className="px-3 py-1.5 text-sm rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              다음
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

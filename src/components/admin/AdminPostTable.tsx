import Link from 'next/link'
import { AdminDeleteButton } from './AdminDeleteButton'

interface AdminPostTableProps {
  posts: Array<{
    id: number
    title: string
    is_deleted: boolean
    deleted_at: string | null
    created_at: string
    view_count: number
    like_count: number
    author: { nickname: string } | null
  }>
  currentPage: number
  totalPages: number
}

export function AdminPostTable({ posts, currentPage, totalPages }: AdminPostTableProps) {
  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500 w-16">ID</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">제목</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 w-28">작성자</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500 w-20">조회수</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500 w-20">좋아요</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 w-36">작성일</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500 w-20">상태</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500 w-20">삭제</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  게시글이 없습니다.
                </td>
              </tr>
            )}
            {posts.map((post) => (
              <tr key={post.id} className={post.is_deleted ? 'bg-red-50' : 'hover:bg-gray-50'}>
                <td className="px-4 py-3 text-gray-500 tabular-nums">{post.id}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      post.is_deleted ? 'text-gray-400 line-through' : 'text-gray-900'
                    }
                    title={post.title}
                  >
                    {post.title.length > 40 ? post.title.slice(0, 40) + '…' : post.title}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{post.author?.nickname ?? '-'}</td>
                <td className="px-4 py-3 text-right text-gray-600 tabular-nums">
                  {post.view_count.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-gray-600 tabular-nums">
                  {post.like_count.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-gray-500 tabular-nums whitespace-nowrap">
                  {new Date(post.created_at).toLocaleDateString('ko-KR')}
                </td>
                <td className="px-4 py-3 text-center">
                  {post.is_deleted ? (
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
                  <AdminDeleteButton type="post" id={post.id} isDeleted={post.is_deleted} />
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

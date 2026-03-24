import { AdminCommentTable } from '@/components/admin/AdminCommentTable'
import { getAdminComments } from '@/app/actions/admin'
import { redirect } from 'next/navigation'

interface AdminCommentsPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function AdminCommentsPage({ searchParams }: AdminCommentsPageProps) {
  const { page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1)

  const result = await getAdminComments(page, 30)

  if ('error' in result) {
    redirect('/')
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">댓글 관리</h1>
        <p className="mt-1 text-sm text-gray-500">
          전체 댓글을 조회하고 삭제할 수 있습니다. (삭제된 댓글 포함)
        </p>
      </div>
      <AdminCommentTable
        comments={result.comments}
        currentPage={result.currentPage}
        totalPages={result.totalPages}
      />
    </div>
  )
}

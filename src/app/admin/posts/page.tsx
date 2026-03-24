import { AdminPostTable } from '@/components/admin/AdminPostTable'
import { getAdminPosts } from '@/app/actions/admin'
import { redirect } from 'next/navigation'

interface AdminPostsPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function AdminPostsPage({ searchParams }: AdminPostsPageProps) {
  const { page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1)

  const result = await getAdminPosts(page, 20)

  if ('error' in result) {
    redirect('/')
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">게시글 관리</h1>
        <p className="mt-1 text-sm text-gray-500">
          전체 게시글을 조회하고 삭제할 수 있습니다. (삭제된 게시글 포함)
        </p>
      </div>
      <AdminPostTable
        posts={result.posts}
        currentPage={result.currentPage}
        totalPages={result.totalPages}
      />
    </div>
  )
}

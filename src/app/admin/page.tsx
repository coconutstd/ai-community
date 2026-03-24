import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = createAdminClient()

  const [
    { count: totalPosts },
    { count: deletedPosts },
    { count: totalComments },
    { count: deletedComments },
  ] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('is_deleted', true),
    supabase.from('comments').select('*', { count: 'exact', head: true }),
    supabase.from('comments').select('*', { count: 'exact', head: true }).eq('is_deleted', true),
  ])

  const stats = [
    { label: '전체 게시글', value: totalPosts ?? 0, highlight: false },
    { label: '삭제된 게시글', value: deletedPosts ?? 0, highlight: true },
    { label: '전체 댓글', value: totalComments ?? 0, highlight: false },
    { label: '삭제된 댓글', value: deletedComments ?? 0, highlight: true },
  ]

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">대시보드</h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-sm text-gray-500">{s.label}</div>
            <div
              className={`text-3xl font-bold mt-1 ${s.highlight ? 'text-red-600' : 'text-gray-900'}`}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/admin/posts"
          className="block p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="text-lg font-semibold text-gray-900">게시글 관리</div>
          <div className="text-sm text-gray-500 mt-1">전체 게시글 조회 및 삭제</div>
        </Link>
        <Link
          href="/admin/comments"
          className="block p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="text-lg font-semibold text-gray-900">댓글 관리</div>
          <div className="text-sm text-gray-500 mt-1">전체 댓글 조회 및 삭제</div>
        </Link>
      </div>
    </div>
  )
}

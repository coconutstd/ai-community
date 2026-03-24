import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <nav className="flex items-center gap-6">
              <span className="text-sm font-semibold text-gray-400 tracking-wide uppercase">
                관리자
              </span>
              <div className="h-4 w-px bg-gray-200" />
              <Link
                href="/admin/posts"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                게시글 관리
              </Link>
              <Link
                href="/admin/comments"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                댓글 관리
              </Link>
            </nav>
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1"
            >
              사이트로 돌아가기
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  )
}

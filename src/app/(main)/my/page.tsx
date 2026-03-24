import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function MyPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('nickname, email')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{profile?.nickname}</h1>
        <p className="text-sm text-gray-500 mt-1">{profile?.email}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/my/posts"
          className="block p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="text-lg font-semibold text-gray-900">내가 쓴 글</div>
          <div className="text-sm text-gray-500 mt-1">작성한 게시글 목록</div>
        </Link>
        <Link
          href="/my/bookmarks"
          className="block p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="text-lg font-semibold text-gray-900">북마크</div>
          <div className="text-sm text-gray-500 mt-1">저장한 게시글 목록</div>
        </Link>
      </div>
    </div>
  )
}

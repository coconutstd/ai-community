'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

export function Header() {
  const router = useRouter()
  const { profile, openLoginModal, clear } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    clear()
    router.push('/')
  }

  const handleWriteClick = () => {
    if (!profile) {
      openLoginModal()
    }
  }

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmed = searchQuery.trim()
    if (!trimmed) return
    router.push(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-14 max-w-4xl items-center gap-4 px-4">
        <Link
          href="/"
          className="shrink-0 text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors"
        >
          AI 커뮤니티
        </Link>

        <form
          onSubmit={handleSearch}
          role="search"
          className="flex flex-1 items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 focus-within:border-blue-400 focus-within:bg-white transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 shrink-0 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="검색..."
            aria-label="게시글 검색"
            className="flex-1 min-w-0 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
          />
        </form>

        <nav className="flex shrink-0 items-center gap-2">
          {profile ? (
            <>
              <Link href="/my" className="text-sm text-gray-700 hover:text-blue-600 transition-colors mr-1">
                {profile.nickname}
              </Link>
              {profile.is_admin && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm">
                    관리자
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                로그아웃
              </Button>
              <Link href="/posts/new">
                <Button size="sm">글쓰기</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  로그인
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="secondary" size="sm">
                  회원가입
                </Button>
              </Link>
              <Button size="sm" onClick={handleWriteClick}>
                글쓰기
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

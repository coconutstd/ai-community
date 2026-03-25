'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
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
    } else {
      router.push('/posts/new')
    }
  }

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmed = searchQuery.trim()
    if (!trimmed) return
    router.push(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  const navLinks = [
    { href: '/', label: '홈' },
    { href: '/my/bookmarks', label: '내 북마크' },
  ]

  return (
    <header className="sticky top-0 z-50 backdrop-blur-[8px] bg-[rgba(15,23,42,0.6)] border-b border-[rgba(255,255,255,0.1)]">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 xl:px-[112px]">
        <div className="flex h-[64px] items-center justify-between gap-6">
          {/* 로고 + 네비 */}
          <div className="flex items-center gap-8 shrink-0">
            {/* 로고 */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div
                className="w-10 h-10 rounded-[12px] flex items-center justify-center relative shrink-0"
                style={{ backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}
              >
                <div className="absolute inset-0 rounded-[12px] shadow-[0px_10px_15px_-3px_rgba(59,130,246,0.2)]" />
                <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                  <path d="M10 0L20 6V10L10 16L0 10V6L10 0Z" fill="white" opacity="0.85"/>
                  <circle cx="10" cy="8" r="3.5" fill="white"/>
                </svg>
              </div>
              <span className="text-[20px] font-bold text-white tracking-[-0.5px]">AI 커뮤니티</span>
            </Link>

            {/* 네비게이션 */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => {
                const isActive = link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex flex-col items-center py-[20px] text-[16px] border-b-2 transition-colors',
                      isActive
                        ? 'text-[#3b82f6] border-[#3b82f6] font-bold'
                        : 'text-[#94a3b8] border-transparent hover:text-white'
                    )}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* 검색 + 우측 액션 */}
          <div className="flex items-center gap-4">
            {/* 검색 */}
            <form
              onSubmit={handleSearch}
              role="search"
              className="relative hidden sm:flex items-center w-[256px]"
            >
              <div className="absolute left-4 pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="7" cy="7" r="5" stroke="#64748b" strokeWidth="1.5"/>
                  <path d="M11 11L14 14" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="검색어를 입력해주세요."
                aria-label="게시글 검색"
                className="w-full h-[40px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full pl-[41px] pr-4 text-[14px] text-white placeholder:text-[#64748b] outline-none focus:border-[rgba(59,130,246,0.4)] transition-colors"
              />
            </form>

            {/* 글쓰기 버튼 */}
            <button
              onClick={handleWriteClick}
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white text-[14px] font-medium px-6 py-[10px] rounded-full shadow-[0px_10px_15px_-3px_rgba(59,130,246,0.25)] hover:opacity-90 transition-opacity"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              글쓰기
            </button>

            {/* 프로필 / 로그인 */}
            {profile ? (
              <div className="flex items-center gap-3">
                {profile.is_admin && (
                  <Link href="/admin" className="text-[14px] text-[#94a3b8] hover:text-white transition-colors hidden md:block">
                    관리자
                  </Link>
                )}
                <button onClick={handleLogout} className="text-[14px] text-[#94a3b8] hover:text-white transition-colors hidden md:block">
                  로그아웃
                </button>
                <Link href="/my">
                  <div className="w-10 h-10 rounded-full bg-[#1e293b] border border-[rgba(255,255,255,0.1)] overflow-hidden flex items-center justify-center">
                    {profile.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.avatar_url} alt={profile.nickname} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[14px] font-medium text-white">
                        {profile.nickname?.[0]?.toUpperCase() ?? 'U'}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-[14px] text-[#94a3b8] hover:text-white transition-colors px-3 py-2">
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="text-[14px] text-white font-medium bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] rounded-full px-4 py-2 hover:bg-[rgba(255,255,255,0.15)] transition-colors"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

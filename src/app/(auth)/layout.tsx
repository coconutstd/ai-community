import type { ReactNode } from 'react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#050b14] flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      {/* 배경 블롭 */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-[200px] bg-[rgba(59,130,246,0.4)] blur-[40px] opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-150px] right-[-100px] w-[500px] h-[500px] rounded-[250px] bg-[rgba(139,92,246,0.3)] blur-[40px] opacity-50 pointer-events-none" />
      <div className="absolute top-[260px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-[150px] bg-[rgba(14,165,233,0.3)] blur-[40px] opacity-50 pointer-events-none" />

      {/* 헤더 — 좌상단 고정 */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 relative"
          style={{ backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}
        >
          <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
            <path d="M10 0L20 6V10L10 16L0 10V6L10 0Z" fill="white" opacity="0.85"/>
            <circle cx="10" cy="8" r="3.5" fill="white"/>
          </svg>
        </div>
        <Link href="/">
          <span className="text-[20px] font-bold text-white tracking-[-0.5px]">
            AI 커뮤니티
          </span>
        </Link>
      </div>

      {/* 카드 */}
      <div className="relative w-full max-w-[448px] z-10">
        <div className="relative backdrop-blur-[8px] bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] rounded-[16px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden px-[41px] pt-[41px] pb-[57px]">
          {/* 상단 그라디언트 바 */}
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-[#3b82f6] via-[#8b5cf6] to-[#3b82f6] opacity-70" />
          {children}
        </div>
      </div>

      {/* 푸터 */}
      <div className="mt-8">
        <p className="text-[#4b5563] text-[12px]">© 2026 AI Community. All rights reserved.</p>
      </div>
    </div>
  )
}

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.4)]">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 xl:px-[112px] py-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* 로고 */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0"
              style={{ backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}
            >
              <svg width="17" height="14" viewBox="0 0 20 16" fill="none">
                <path d="M10 0L20 6V10L10 16L0 10V6L10 0Z" fill="white" opacity="0.85"/>
                <circle cx="10" cy="8" r="3.5" fill="white"/>
              </svg>
            </div>
            <span className="text-[14px] font-bold text-white">AI 커뮤니티</span>
          </div>

          {/* 저작권 */}
          <p className="text-[14px] text-[#94a3b8]">
            © 2026 AI 커뮤니티 게시판. All rights reserved.
          </p>

          {/* 링크 */}
          <div className="flex items-center gap-6">
            <Link href="#" className="text-[14px] text-[#94a3b8] hover:text-white transition-colors">이용약관</Link>
            <Link href="#" className="text-[14px] text-[#94a3b8] hover:text-white transition-colors">개인정보처리방침</Link>
            <Link href="#" className="text-[14px] text-[#94a3b8] hover:text-white transition-colors">문의하기</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

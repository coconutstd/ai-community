'use client'

import dynamic from 'next/dynamic'

const LoginModal = dynamic(() => import('@/components/auth/LoginModal').then((mod) => mod.LoginModal), { ssr: false })

export function LoginModalDynamic() {
  return <LoginModal />
}

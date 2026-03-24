'use client'

import { useEffect, useRef } from 'react'

interface ViewCounterProps {
  postId: number
}

export function ViewCounter({ postId }: ViewCounterProps) {
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true
    fetch(`/api/posts/${postId}/view`, { method: 'POST' }).catch(() => {
      // 조회수 증가 실패는 사용자 경험에 영향 없으므로 조용히 무시
    })
  }, [postId])

  return null
}

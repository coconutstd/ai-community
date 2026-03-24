'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'

interface UseLikeParams {
  postId: number
  initialIsLiked: boolean
  initialLikeCount: number
}

export function useLike({ postId, initialIsLiked, initialLikeCount }: UseLikeParams) {
  const { user, openLoginModal } = useAuthStore()

  const committedRef = useRef({ isLiked: initialIsLiked, likeCount: initialLikeCount })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const toggle = () => {
    if (!user) {
      openLoginModal()
      return
    }

    const nextLiked = !isLiked
    setIsLiked(nextLiked)
    setLikeCount((prev) => (nextLiked ? prev + 1 : prev - 1))

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      if (nextLiked === committedRef.current.isLiked) return

      const rl = await fetch('/api/rate-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_type: 'like' }),
      })
      if (rl.status === 429) {
        setIsLiked(committedRef.current.isLiked)
        setLikeCount(committedRef.current.likeCount)
        toast.error('잠시 후 다시 시도해주세요.')
        return
      }

      const supabase = createClient()

      if (nextLiked) {
        const { error } = await supabase
          .from('likes')
          .upsert({ post_id: postId, user_id: user.id }, { onConflict: 'post_id,user_id' })

        if (error) {
          setIsLiked(committedRef.current.isLiked)
          setLikeCount(committedRef.current.likeCount)
          toast.error('오류가 발생했습니다. 다시 시도해주세요.')
          return
        }
      } else {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)

        if (error) {
          setIsLiked(committedRef.current.isLiked)
          setLikeCount(committedRef.current.likeCount)
          toast.error('오류가 발생했습니다. 다시 시도해주세요.')
          return
        }
      }

      committedRef.current = {
        isLiked: nextLiked,
        likeCount: nextLiked
          ? committedRef.current.likeCount + 1
          : committedRef.current.likeCount - 1,
      }
    }, 300)
  }

  return { isLiked, likeCount, toggle }
}

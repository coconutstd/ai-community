'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'

interface UseBookmarkParams {
  postId: number
  initialIsBookmarked: boolean
}

export function useBookmark({ postId, initialIsBookmarked }: UseBookmarkParams) {
  const { user, openLoginModal } = useAuthStore()
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked)
  const [isPending, setIsPending] = useState(false)

  const toggle = async () => {
    if (!user) {
      openLoginModal()
      return
    }
    if (isPending) return

    const next = !isBookmarked
    setIsBookmarked(next)
    setIsPending(true)

    const supabase = createClient()

    if (next) {
      const { error } = await supabase
        .from('bookmarks')
        .upsert({ post_id: postId, user_id: user.id }, { onConflict: 'post_id,user_id' })

      if (error) {
        setIsBookmarked(!next)
        toast.error('오류가 발생했습니다. 다시 시도해주세요.')
      } else {
        toast.success('북마크에 추가됐습니다.')
      }
    } else {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)

      if (error) {
        setIsBookmarked(!next)
        toast.error('오류가 발생했습니다. 다시 시도해주세요.')
      } else {
        toast.success('북마크가 해제됐습니다.')
      }
    }

    setIsPending(false)
  }

  return { isBookmarked, toggle, isPending }
}

'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/authStore'

export function AuthInitializer() {
  const { setUser, setProfile, setLoading, clear } = useAuthStore()

  useEffect(() => {
    const supabase = createClient()

    const initAuth = async () => {
      try {
        // getSession()은 localStorage를 읽지만 SSR은 쿠키 기반 세션을 사용함.
        // getUser()는 서버에 직접 검증하므로 쿠키 기반 세션도 올바르게 읽음.
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (user && !error) {
          setUser(user)
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()
          if (profile) setProfile(profile)
        } else {
          clear()
        }
      } catch {
        clear()
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (profile) setProfile(profile)
      } else {
        clear()
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

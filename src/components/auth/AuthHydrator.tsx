'use client'

import { useRef } from 'react'
import { useAuthStore } from '@/stores/authStore'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type UserProfile = Database['public']['Tables']['users']['Row']

interface AuthHydratorProps {
  user: User | null
  profile: UserProfile | null
}

export function AuthHydrator({ user, profile }: AuthHydratorProps) {
  const initialized = useRef(false)

  if (!initialized.current) {
    useAuthStore.setState({
      user: user ?? null,
      profile: profile ?? null,
      isLoading: false,
    })
    initialized.current = true
  }

  return null
}

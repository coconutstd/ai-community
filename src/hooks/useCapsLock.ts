'use client'

import { useState, useEffect } from 'react'

export function useCapsLock(): boolean {
  const [isCapsLockOn, setIsCapsLockOn] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (typeof e.getModifierState === 'function') {
        setIsCapsLockOn(e.getModifierState('CapsLock'))
      }
    }
    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
    }
  }, [])

  return isCapsLockOn
}

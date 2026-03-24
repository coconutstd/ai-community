'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <h2 className="text-xl font-semibold text-gray-800">오류가 발생했습니다</h2>
      <p className="text-gray-500">일시적인 오류입니다. 잠시 후 다시 시도해주세요.</p>
      <button
        onClick={reset}
        className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        다시 시도
      </button>
    </div>
  )
}

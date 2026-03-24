'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { adminDeletePost, adminDeleteComment } from '@/app/actions/admin'

interface AdminDeleteButtonProps {
  type: 'post' | 'comment'
  id: number
  isDeleted: boolean
}

export function AdminDeleteButton({ type, id, isDeleted }: AdminDeleteButtonProps) {
  const [isPending, startTransition] = useTransition()

  if (isDeleted) {
    return <span className="text-xs text-gray-400">삭제됨</span>
  }

  const handleDelete = () => {
    const label = type === 'post' ? '게시글' : '댓글'
    if (!confirm(`이 ${label}을 삭제하시겠습니까?`)) return

    startTransition(async () => {
      const action = type === 'post' ? adminDeletePost(id) : adminDeleteComment(id)
      const result = await action
      if (result.error) {
        alert(result.error)
      }
    })
  }

  return (
    <Button
      variant="danger"
      size="sm"
      isLoading={isPending}
      onClick={handleDelete}
      disabled={isPending}
    >
      삭제
    </Button>
  )
}

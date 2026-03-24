'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { deletePost } from '@/app/actions/posts'

interface DeleteButtonProps {
  postId: number
}

export function DeleteButton({ postId }: DeleteButtonProps) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('게시글을 삭제하시겠습니까?')) return

    const result = await deletePost(postId)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success('게시글이 삭제되었습니다.')
    router.push('/')
  }

  return (
    <Button variant="danger" size="sm" onClick={handleDelete}>
      삭제
    </Button>
  )
}

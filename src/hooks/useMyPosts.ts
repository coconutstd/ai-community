import { useInfiniteQuery } from '@tanstack/react-query'
import { getMyPosts } from '@/app/actions/my'
import type { PostWithAuthor } from '@/hooks/usePosts'

export function useMyPosts() {
  return useInfiniteQuery({
    queryKey: ['my-posts'],
    queryFn: async ({ pageParam }) => {
      return getMyPosts(pageParam ?? undefined)
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      if (lastPage.length < 10) return undefined
      return lastPage[lastPage.length - 1].created_at
    },
  })
}

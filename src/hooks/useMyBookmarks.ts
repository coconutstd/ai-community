import { useInfiniteQuery } from '@tanstack/react-query'
import { getMyBookmarks, type BookmarkedPost } from '@/app/actions/my'

export type { BookmarkedPost }

export function useMyBookmarks() {
  return useInfiniteQuery({
    queryKey: ['my-bookmarks'],
    queryFn: async ({ pageParam }) => {
      return getMyBookmarks(pageParam ?? undefined)
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      if (lastPage.length < 10) return undefined
      return lastPage[lastPage.length - 1].bookmarkedAt
    },
  })
}

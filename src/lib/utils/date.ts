import { formatDistanceToNow, differenceInDays, format } from 'date-fns'
import { ko } from 'date-fns/locale'

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const diffDays = differenceInDays(new Date(), date)
  if (diffDays >= 7) return format(date, 'yyyy.MM.dd')
  return formatDistanceToNow(date, { addSuffix: true, locale: ko })
}

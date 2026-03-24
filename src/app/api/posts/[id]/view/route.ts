import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const postId = parseInt(id, 10)

  if (isNaN(postId)) {
    return NextResponse.json({ error: 'Invalid post id' }, { status: 400 })
  }

  const supabase = await createClient()
  await supabase.rpc('increment_view_count', { p_post_id: postId })

  return NextResponse.json({ ok: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/utils/rateLimit'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ allowed: false }, { status: 401 })

  const { action_type } = await req.json()
  const result = await checkRateLimit(user.id, action_type)
  return NextResponse.json(result, { status: result.allowed ? 200 : 429 })
}

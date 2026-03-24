import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const nickname = searchParams.get('nickname')

  if (!nickname || nickname.trim().length === 0) {
    return NextResponse.json(
      { error: '닉네임을 입력해 주세요.' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('nickname', nickname.trim())
    .maybeSingle()

  if (error) {
    return NextResponse.json(
      { error: '닉네임 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ available: data === null })
}

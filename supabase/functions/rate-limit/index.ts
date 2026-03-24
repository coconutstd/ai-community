import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const LIMITS: Record<string, number> = { post: 5, comment: 10, like: 30, search: 30 }

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })

  const { user_id, action_type } = await req.json()
  if (!user_id || !LIMITS[action_type])
    return new Response(JSON.stringify({ error: 'Invalid params' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const windowStart = new Date()
  windowStart.setSeconds(0, 0)

  const { data: count, error } = await supabase.rpc('upsert_rate_limit', {
    p_user_id: user_id,
    p_action_type: action_type,
    p_window_start: windowStart.toISOString(),
  })

  if (error) {
    console.error('Rate limit DB error:', error)
    return new Response(JSON.stringify({ allowed: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const limit = LIMITS[action_type]
  if ((count as number) > limit)
    return new Response(JSON.stringify({ allowed: false, retryAfter: 60 }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    })

  return new Response(
    JSON.stringify({ allowed: true, remaining: limit - (count as number) }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
})

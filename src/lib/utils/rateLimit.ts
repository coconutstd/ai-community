type ActionType = 'post' | 'comment' | 'like' | 'search'

export async function checkRateLimit(
  userId: string,
  actionType: ActionType,
): Promise<{ allowed: boolean }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return { allowed: true }

  try {
    const res = await fetch(`${url}/functions/v1/rate-limit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ user_id: userId, action_type: actionType }),
    })
    if (res.status === 429) return { allowed: false }
    return { allowed: true }
  } catch {
    return { allowed: true }
  }
}

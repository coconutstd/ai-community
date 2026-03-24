-- rate_limits 테이블 (RLS: service_role만 접근)
CREATE TABLE public.rate_limits (
  user_id      UUID  NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action_type  TEXT  NOT NULL CHECK (action_type IN ('post', 'comment', 'like', 'search')),
  window_start TIMESTAMPTZ NOT NULL,
  count        INT   NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, action_type, window_start)
);
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_only" ON public.rate_limits USING (false);

-- upsert_rate_limit RPC
CREATE OR REPLACE FUNCTION public.upsert_rate_limit(
  p_user_id UUID, p_action_type TEXT, p_window_start TIMESTAMPTZ
) RETURNS INT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_count INT;
BEGIN
  INSERT INTO public.rate_limits (user_id, action_type, window_start, count)
  VALUES (p_user_id, p_action_type, p_window_start, 1)
  ON CONFLICT (user_id, action_type, window_start)
  DO UPDATE SET count = rate_limits.count + 1
  RETURNING count INTO v_count;
  RETURN v_count;
END; $$;

-- pg_cron cleanup
SELECT cron.schedule('cleanup-rate-limits', '0 * * * *',
  $$ DELETE FROM public.rate_limits WHERE window_start < now() - INTERVAL '2 minutes'; $$
);

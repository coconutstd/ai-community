-- ============================================================
-- updated_at 자동 갱신 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Auth 가입 시 users 테이블 자동 동기화
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nickname, is_email_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'nickname',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 이메일 인증 완료 시 동기화
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_email_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.users
    SET is_email_verified = true
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_email_confirmed();

-- ============================================================
-- 좋아요 카운트 캐시 동기화 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_likes_sync
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.sync_like_count();

-- ============================================================
-- 댓글 카운트 캐시 동기화 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.is_deleted = true AND OLD.is_deleted = false THEN
    UPDATE public.posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = NEW.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_comments_sync
  AFTER INSERT OR UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.sync_comment_count();

-- ============================================================
-- FTS 검색 함수
-- ============================================================
CREATE OR REPLACE FUNCTION public.search_posts(
  query_text TEXT,
  p_limit    INT DEFAULT 20,
  p_offset   INT DEFAULT 0
)
RETURNS TABLE (
  id            BIGINT,
  title         TEXT,
  content       TEXT,
  author_id     UUID,
  category_tool category_tool_type,
  category_task category_task_type,
  view_count    INT,
  like_count    INT,
  comment_count INT,
  created_at    TIMESTAMPTZ,
  rank          REAL,
  highlighted_title TEXT,
  highlighted_content TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.title, p.content, p.author_id,
    p.category_tool, p.category_task,
    p.view_count, p.like_count, p.comment_count,
    p.created_at,
    ts_rank(
      to_tsvector('simple', p.title || ' ' || p.content),
      plainto_tsquery('simple', query_text)
    ) AS rank,
    ts_headline(
      'simple', p.title,
      plainto_tsquery('simple', query_text),
      'StartSel=<mark>, StopSel=</mark>, MaxWords=20, MinWords=5'
    ) AS highlighted_title,
    ts_headline(
      'simple', p.content,
      plainto_tsquery('simple', query_text),
      'StartSel=<mark>, StopSel=</mark>, MaxWords=50, MinWords=10, MaxFragments=2'
    ) AS highlighted_content
  FROM public.posts p
  WHERE
    is_deleted = false
    AND to_tsvector('simple', p.title || ' ' || p.content)
        @@ plainto_tsquery('simple', query_text)
  ORDER BY rank DESC, p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 조회수 증가 (RPC로 호출)
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_view_count(p_post_id BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts
  SET view_count = view_count + 1
  WHERE id = p_post_id AND is_deleted = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 로그인 실패 잠금 처리 함수
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_login_attempt(
  p_email   TEXT,
  p_success BOOLEAN
)
RETURNS JSON AS $$
DECLARE
  v_user public.users%ROWTYPE;
BEGIN
  SELECT * INTO v_user FROM public.users WHERE email = p_email;

  IF NOT FOUND THEN
    RETURN json_build_object('locked', false);
  END IF;

  -- 잠금 상태 확인
  IF v_user.login_lock_until IS NOT NULL AND v_user.login_lock_until > now() THEN
    RETURN json_build_object('locked', true, 'unlock_at', v_user.login_lock_until);
  END IF;

  IF p_success THEN
    UPDATE public.users
    SET login_fail_count = 0, login_lock_until = NULL
    WHERE email = p_email;
  ELSE
    UPDATE public.users
    SET
      login_fail_count = login_fail_count + 1,
      login_lock_until = CASE
        WHEN login_fail_count + 1 >= 5 THEN now() + INTERVAL '10 minutes'
        ELSE NULL
      END
    WHERE email = p_email;
  END IF;

  RETURN json_build_object('locked', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

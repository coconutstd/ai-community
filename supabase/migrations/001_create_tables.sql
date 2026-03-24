-- ============================================================
-- ENUM 타입 정의
-- ============================================================
CREATE TYPE category_tool_type AS ENUM (
  'chatgpt', 'claude', 'gemini', 'midjourney',
  'stable_diffusion', 'copilot', 'cursor', 'other'
);

CREATE TYPE category_task_type AS ENUM (
  'writing', 'coding', 'image', 'video', 'audio',
  'data_analysis', 'research', 'productivity', 'other'
);

-- ============================================================
-- USERS 테이블 (Supabase Auth 연동)
-- ============================================================
CREATE TABLE public.users (
  id                UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email             TEXT        NOT NULL UNIQUE,
  nickname          TEXT        NOT NULL UNIQUE,
  avatar_url        TEXT,
  is_email_verified BOOLEAN     NOT NULL DEFAULT false,
  is_admin          BOOLEAN     NOT NULL DEFAULT false,
  login_fail_count  SMALLINT    NOT NULL DEFAULT 0,
  login_lock_until  TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT nickname_length CHECK (char_length(nickname) BETWEEN 2 AND 20)
);

-- ============================================================
-- POSTS 테이블
-- ============================================================
CREATE TABLE public.posts (
  id              BIGSERIAL   PRIMARY KEY,
  title           TEXT        NOT NULL,
  content         TEXT        NOT NULL,
  author_id       UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_tool   category_tool_type,
  category_task   category_task_type,
  view_count      INT         NOT NULL DEFAULT 0,
  like_count      INT         NOT NULL DEFAULT 0,
  comment_count   INT         NOT NULL DEFAULT 0,
  is_deleted      BOOLEAN     NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ,

  CONSTRAINT title_length   CHECK (char_length(title)   BETWEEN 1 AND 100),
  CONSTRAINT content_length CHECK (char_length(content) BETWEEN 1 AND 10000)
);

-- ============================================================
-- COMMENTS 테이블
-- ============================================================
CREATE TABLE public.comments (
  id          BIGSERIAL   PRIMARY KEY,
  post_id     BIGINT      NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id   UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content     TEXT        NOT NULL,
  is_deleted  BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMPTZ,

  CONSTRAINT content_length CHECK (char_length(content) BETWEEN 1 AND 500)
);

-- ============================================================
-- LIKES 테이블
-- ============================================================
CREATE TABLE public.likes (
  user_id    UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id    BIGINT      NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (user_id, post_id)
);

-- ============================================================
-- BOOKMARKS 테이블
-- ============================================================
CREATE TABLE public.bookmarks (
  user_id    UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id    BIGINT      NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (user_id, post_id)
);

-- ============================================================
-- MEDIA 테이블
-- ============================================================
CREATE TABLE public.media (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id  UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id      BIGINT      REFERENCES public.posts(id) ON DELETE SET NULL,
  storage_path TEXT        NOT NULL,
  file_type    TEXT        NOT NULL,
  file_size    INT,
  is_used      BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

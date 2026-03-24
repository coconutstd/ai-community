-- ============================================================
-- POSTS 인덱스
-- ============================================================
-- 목록 조회: 최신순 (cursor 기반 페이지네이션)
CREATE INDEX idx_posts_created_at
  ON public.posts (id DESC, created_at DESC)
  WHERE is_deleted = false;

-- 목록 조회: 인기순
CREATE INDEX idx_posts_popularity
  ON public.posts (like_count DESC, comment_count DESC, id DESC)
  WHERE is_deleted = false;

-- 카테고리 필터링
CREATE INDEX idx_posts_category_tool
  ON public.posts (category_tool, id DESC)
  WHERE is_deleted = false;

CREATE INDEX idx_posts_category_task
  ON public.posts (category_task, id DESC)
  WHERE is_deleted = false;

-- 복합 카테고리 필터 (AND 조건)
CREATE INDEX idx_posts_category_both
  ON public.posts (category_tool, category_task, id DESC)
  WHERE is_deleted = false;

-- 작성자별 조회 (내가 쓴 글)
CREATE INDEX idx_posts_author_id
  ON public.posts (author_id, id DESC)
  WHERE is_deleted = false;

-- Soft Delete 배치 처리용
CREATE INDEX idx_posts_deleted
  ON public.posts (deleted_at)
  WHERE is_deleted = true;

-- Full Text Search (한국어 + 영어 simple 설정)
CREATE INDEX idx_posts_fts
  ON public.posts
  USING gin(to_tsvector('simple', title || ' ' || content))
  WHERE is_deleted = false;

-- ============================================================
-- COMMENTS 인덱스
-- ============================================================
CREATE INDEX idx_comments_post_id
  ON public.comments (post_id, created_at ASC)
  WHERE is_deleted = false;

CREATE INDEX idx_comments_author_id
  ON public.comments (author_id);

-- ============================================================
-- LIKES / BOOKMARKS 인덱스
-- ============================================================
CREATE INDEX idx_likes_post_id     ON public.likes     (post_id);
CREATE INDEX idx_bookmarks_post_id ON public.bookmarks (post_id);

-- 북마크 목록 페이지 (최신순)
CREATE INDEX idx_bookmarks_user_id ON public.bookmarks (user_id, created_at DESC);

-- ============================================================
-- MEDIA 인덱스
-- ============================================================
-- 미사용 이미지 정리 배치용
CREATE INDEX idx_media_cleanup
  ON public.media (created_at)
  WHERE is_used = false;

-- 게시글별 미디어 조회
CREATE INDEX idx_media_post_id ON public.media (post_id);

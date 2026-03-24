-- ============================================================
-- RLS 활성화
-- ============================================================
ALTER TABLE public.users     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media     ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- USERS 정책
-- ============================================================
CREATE POLICY "users: 누구나 조회"
  ON public.users FOR SELECT USING (true);

CREATE POLICY "users: 본인만 수정"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users: 시스템 생성만 허용"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- POSTS 정책
-- ============================================================
CREATE POLICY "posts: 비삭제 게시글 누구나 조회"
  ON public.posts FOR SELECT
  USING (is_deleted = false);

CREATE POLICY "posts: 로그인 사용자 작성"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

CREATE POLICY "posts: 본인 또는 Admin 수정"
  ON public.posts FOR UPDATE
  USING (
    auth.uid() = author_id
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    auth.uid() = author_id
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "posts: 본인 또는 Admin 삭제"
  ON public.posts FOR DELETE
  USING (
    auth.uid() = author_id
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============================================================
-- COMMENTS 정책
-- ============================================================
CREATE POLICY "comments: 누구나 조회"
  ON public.comments FOR SELECT USING (true);

CREATE POLICY "comments: 로그인 사용자 작성"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

CREATE POLICY "comments: 본인 또는 Admin 수정/삭제"
  ON public.comments FOR UPDATE
  USING (
    auth.uid() = author_id
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "comments: 본인 또는 Admin 삭제"
  ON public.comments FOR DELETE
  USING (
    auth.uid() = author_id
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============================================================
-- LIKES 정책
-- ============================================================
CREATE POLICY "likes: 본인 데이터 조회"
  ON public.likes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "likes: 본인만 추가"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "likes: 본인만 삭제"
  ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- BOOKMARKS 정책
-- ============================================================
CREATE POLICY "bookmarks: 본인 데이터 조회"
  ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "bookmarks: 본인만 추가"
  ON public.bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bookmarks: 본인만 삭제"
  ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- MEDIA 정책
-- ============================================================
CREATE POLICY "media: 업로더 본인만 조회"
  ON public.media FOR SELECT USING (auth.uid() = uploader_id);

CREATE POLICY "media: 로그인 사용자 업로드"
  ON public.media FOR INSERT
  WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY "media: 업로더 본인만 수정"
  ON public.media FOR UPDATE USING (auth.uid() = uploader_id);

-- ============================================================
-- Storage RLS (post-images 버킷)
-- ============================================================
-- Supabase Dashboard > Storage > Policies 에서 적용하거나
-- 아래 SQL을 직접 실행하세요.

CREATE POLICY "post-images: 누구나 조회"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-images');

CREATE POLICY "post-images: 로그인 사용자 업로드"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'post-images'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "post-images: 업로더 본인 삭제"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'post-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

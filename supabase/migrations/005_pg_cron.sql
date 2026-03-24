-- ============================================================
-- pg_cron 배치 스케줄
-- Supabase Dashboard > Database > Extensions 에서
-- pg_cron 확장을 먼저 활성화해야 합니다.
-- ============================================================

-- 30일 지난 Soft Delete 게시글 완전 삭제 (매일 새벽 3시)
SELECT cron.schedule(
  'hard-delete-old-posts',
  '0 3 * * *',
  $$
    DELETE FROM public.posts
    WHERE is_deleted = true
      AND deleted_at < now() - INTERVAL '30 days';
  $$
);

-- 30일 지난 Soft Delete 댓글 완전 삭제 (매일 새벽 3시 5분)
SELECT cron.schedule(
  'hard-delete-old-comments',
  '5 3 * * *',
  $$
    DELETE FROM public.comments
    WHERE is_deleted = true
      AND deleted_at < now() - INTERVAL '30 days';
  $$
);

-- 24시간 지난 미사용 미디어 DB 레코드 삭제 (매일 새벽 4시)
-- Storage 파일 삭제는 별도 Edge Function 또는 Storage 정책으로 처리
SELECT cron.schedule(
  'cleanup-unused-media',
  '0 4 * * *',
  $$
    DELETE FROM public.media
    WHERE is_used = false
      AND created_at < now() - INTERVAL '24 hours';
  $$
);

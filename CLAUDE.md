# AI 커뮤니티 게시판 (ai-community)

사내 임직원 전용 AI 활용 팁 공유 커뮤니티. Next.js 15 + Supabase 기반 MVP.
기획 문서: `/Users/user/Desktop/AI_커뮤니티_게시판_기획/`
진행 현황: `/Users/user/Desktop/AI_커뮤니티_게시판_기획/PROGRESS.md`

## 커맨드

```bash
npm run dev      # 개발 서버 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 검사
npx supabase gen types typescript --project-id <ID> > src/types/database.ts  # DB 타입 재생성
```

## 기술 스택

- **Frontend**: Next.js 15 App Router + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **에디터**: Tiptap (인라인 이미지 삽입)
- **서버 상태**: @tanstack/react-query v5 (Infinite Query, Optimistic Update)
- **전역 상태**: Zustand (Auth 상태만)
- **폼**: Zod + react-hook-form
- **토스트**: Sonner
- **날짜**: date-fns

## 디렉토리 구조

```
src/
├── app/
│   ├── (auth)/          # 로그인, 회원가입, 비밀번호 재설정 (비로그인 전용 라우트)
│   ├── (main)/          # 주요 페이지 (공통 Header/Footer 레이아웃)
│   │   ├── posts/       # 게시글 목록, 작성, 상세, 수정
│   │   ├── search/      # 검색 결과
│   │   └── my/          # 내 게시글, 북마크
│   ├── admin/           # Admin 전용 (is_admin=true 체크)
│   └── api/
│       └── auth/callback/route.ts  # 이메일 인증 콜백
├── components/
│   ├── ui/              # 재사용 기본 컴포넌트 (Button, Input, Modal, Skeleton 등)
│   ├── auth/            # LoginForm, SignupForm, LoginModal
│   ├── posts/           # PostList, PostCard, PostEditor, PostDetail
│   ├── comments/        # CommentList, CommentItem, CommentForm
│   └── interactions/    # LikeButton, BookmarkButton
├── lib/
│   ├── supabase/        # client.ts(브라우저), server.ts(서버), middleware.ts
│   ├── utils/           # date.ts (날짜 포맷), text.ts
│   └── validations/     # auth.ts, post.ts (Zod 스키마)
├── hooks/               # useAuth, usePosts, useComments, useLike, useBookmark
├── stores/              # authStore.ts (Zustand)
├── types/               # database.ts (Supabase 생성), index.ts
└── middleware.ts         # 라우트 보호
supabase/
├── migrations/          # 001~005 SQL 파일
└── functions/           # rate-limit Edge Function
```

## 핵심 패턴

### Supabase 클라이언트 분리
- 브라우저(Client Component): `lib/supabase/client.ts` → `createBrowserClient()`
- 서버(Server Component, Server Action, Route Handler): `lib/supabase/server.ts` → `createServerClient()`
- **절대 서버에서 브라우저 클라이언트 사용 금지**

### Server Actions 위치
- 게시글 CRUD: `app/(main)/posts/actions.ts`
- 댓글/좋아요/북마크: `app/(main)/posts/[id]/actions.ts`

### Optimistic Update 패턴
- 좋아요/북마크: `useMutation` onMutate에서 캐시 선반영, onError에서 rollback
- debounce 300ms 적용

### 무한스크롤
- `useInfiniteQuery` + IntersectionObserver
- **cursor 기반** (id < last_id) — offset 사용 금지 (데이터 불일치 발생)

### 이미지 업로드
- 에디터에서 즉시 Storage 업로드 (선업로드)
- `media` 테이블에 `is_used=false`로 등록
- 게시글 저장 시 content의 URL 파싱 → `is_used=true` 업데이트
- 미사용 이미지는 pg_cron이 24시간 후 자동 정리

## 환경 변수 (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## DB 핵심 규칙

- **Soft Delete**: 게시글/댓글 삭제 = `is_deleted=true` + `deleted_at=now()` (실제 DELETE 금지)
- **카운트 캐시**: `posts.like_count`, `posts.comment_count`는 트리거로 자동 동기화 (직접 수정 금지)
- **RLS**: 모든 테이블에 RLS 활성화. Admin 작업 시 `SUPABASE_SERVICE_ROLE_KEY` 사용
- **FTS 검색**: `search_posts()` RPC 함수 사용 (plainto_tsquery 'simple' 설정)

## 제약 조건 (기획 확정)

| 항목 | 제한 |
|------|------|
| 게시글 제목 | 100자 |
| 게시글 본문 | 10,000자 |
| 댓글 | 500자, MVP에서 수정 기능 없음 |
| 이미지 | 10MB 이하, GIF 5MB, 게시글당 최대 10개 |
| 페이지네이션 | 20건 단위 무한스크롤 |
| 로그인 실패 | 5회 → 10분 잠금 |

## 주의사항

- `(auth)` 라우트: 로그인 상태면 `/`으로 리다이렉트
- `/posts/new`, `/my/*`, `/admin/*`: 미로그인 시 `/login` 리다이렉트
- Admin 페이지: `is_admin=true` 체크 (미들웨어 + 레이아웃 이중 체크)
- Supabase Free 플랜: 7일 비활성 시 프로젝트 일시 중지 → 프로덕션은 Pro 필요
- Server Actions는 외부 클라이언트(모바일)에서 호출 불가 → 필요 시 Route Handler로 분리

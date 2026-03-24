# DEVLOG — AI 커뮤니티 게시판

> 이 프로젝트를 어떻게 만들었는지, 어떤 결정을 내렸는지, 어떤 문제를 만났는지 기록합니다.
> 새 기능을 추가할 때마다 아래 형식으로 항목을 추가해주세요.

---

## 프로젝트 개요

AI 활용 팁을 공유하는 사내 커뮤니티 게시판. Next.js 16 + Supabase 풀스택으로 구현.

**기술 스택**

| 영역 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | Next.js 16 (App Router) | Server Actions, RSC로 서버/클라이언트 경계 명확히 |
| DB / Auth / Storage | Supabase | PostgreSQL + RLS + Storage + Edge Functions 올인원 |
| 상태 관리 | Zustand (로컬) + TanStack Query (서버) | 역할을 분리해 과도한 전역 상태 방지 |
| 에디터 | Tiptap | 헤드리스, 확장성, TypeScript 지원 |
| 스타일 | Tailwind CSS v4 | |
| 배포 | Vercel | Next.js 최적화 플랫폼 |

---

## Phase 1 — 기반 설정

**날짜**: 2026-03-24

### 한 일
- Supabase 프로젝트 생성, Auth 설정 (이메일 인증 ON)
- Supabase Storage 버킷 생성 (`post-images`, Public)
- pg_cron 확장 활성화
- Next.js 프로젝트 생성, 핵심 패키지 설치
- DB 마이그레이션 SQL 5개 작성 및 실행

**마이그레이션 구조**
```
supabase/migrations/
├── 001_create_tables.sql   — ENUM, users, posts, comments, likes, bookmarks, media
├── 002_rls_policies.sql    — 테이블별 RLS 정책
├── 003_indexes.sql         — 조회 성능용 인덱스 + FTS GIN 인덱스
├── 004_functions.sql       — 트리거, 검색 함수, 조회수 함수, 로그인 잠금 함수
└── 005_pg_cron.sql         — 배치 스케줄 (Soft Delete 정리, 미디어 정리)
```

### 주요 결정
- **Soft Delete 30일 보관**: `is_deleted=true`로 삭제 처리 후 pg_cron 배치로 30일 뒤 물리 삭제 → 복구 가능성 확보
- **이미지 선업로드**: 에디터에서 이미지 삽입 시 즉시 Storage에 업로드, `media` 테이블에 `is_used=false`로 기록 → 글 제출 시 `is_used=true`로 갱신. 미사용 이미지는 배치로 정리

### 트러블슈팅
- Supabase Free 플랜에서 JWT 만료/세션 시간 설정 불가 → 코드 레벨에서 처리

---

## Phase 2 — 인증 시스템

**날짜**: 2026-03-24

### 한 일
- Supabase 클라이언트 3종 분리: `client.ts` (브라우저), `server.ts` (RSC/Server Action), `middleware.ts` (세션 갱신)
- 회원가입 / 로그인 / 비밀번호 재설정 페이지
- 닉네임 중복 체크 (debounce 300ms)
- 로그인 5회 실패 → 10분 잠금
- Zustand `authStore` + `AuthHydrator` (서버 → 클라이언트 인증 상태 전달)
- `LoginModal` (비로그인 상태에서 보호 라우트 접근 시 팝업)

### 주요 결정
- **인증 방식**: 이메일 + 비밀번호 (Supabase Auth). SSO는 MVP 이후 검토
- **서버 중심 아키텍처**: 브라우저 클라이언트가 쿠키 기반 auth를 읽지 못하는 문제 → `AuthHydrator` 서버 컴포넌트가 세션을 읽어 Zustand에 주입

### 트러블슈팅
- **Next.js 16 변경사항**: `middleware.ts` → `proxy.ts`, `export function middleware` → `export function proxy`
- `@hookform/resolvers` v5.2.2 + Zod v4 호환성 경고 발생하지만 동작은 정상

---

## Phase 3 — 게시글 CRUD

**날짜**: 2026-03-24

### 한 일
- UI 기본 컴포넌트: Button, Input, Skeleton, EmptyState
- 레이아웃: Header, Footer
- PostCard + PostList (무한스크롤, IntersectionObserver + `useInfiniteQuery`)
- PostFilter (카테고리 복합 필터, URL searchParams)
- PostEditor (Tiptap + Image 확장, Supabase Storage 업로드)
- 게시글 작성 / 상세 / 수정 / 삭제 (Soft Delete)
- 조회수 증가 Route Handler (`/api/posts/[id]/view`)

### 주요 결정
- **페이지네이션**: Cursor 기반 무한스크롤. offset 방식은 중간 데이터 삽입 시 중복/누락 발생
- **카테고리**: 툴별(chatgpt, claude, ...) + 업무유형(coding, writing, ...) AND 복합 필터
- **조회수**: 서버 컴포넌트에서 직접 증가시키면 SSR 재요청마다 중복 증가 → 별도 Route Handler로 분리

### 트러블슈팅
- **Tiptap SSR 에러**: `useEditor`에 `immediatelyRender: false` 옵션 필수
- **조회수 이중 증가**: React StrictMode에서 `useEffect` 2번 실행 → `useRef` 플래그로 방지
- **다크 모드 제거**: MVP에서는 라이트 모드 고정, `globals.css` 다크 모드 CSS 변수 삭제
- **DB ENUM 실제 값** 기획서와 다름:
  - `category_tool_type`: `chatgpt, claude, gemini, midjourney, stable_diffusion, copilot, cursor, other`
  - `category_task_type`: `writing, coding, image, video, audio, data_analysis, research, productivity, other`
- **RPC 인자명**: `increment_view_count`의 인자는 `p_post_id` (기획서의 `post_id`와 다름)

---

## Phase 4 — 댓글 + 인터랙션

**날짜**: 2026-03-24

### 한 일
- CommentForm / CommentItem / CommentList
- 댓글 Optimistic UI (작성 즉시 목록 반영)
- LikeButton (Optimistic UI + debounce 300ms)
- BookmarkButton (Optimistic UI)
- 성공/에러 토스트 (Sonner)

### 주요 결정
- **댓글 수정 MVP 제외**: 삭제 후 재작성 유도. 수정 기능은 복잡도 대비 효용이 낮음
- **Soft Delete 댓글 표시**: 삭제된 댓글은 "삭제된 댓글입니다." 텍스트로 대체 (대댓글 맥락 유지)
- **Optimistic UI 범위**: 좋아요/북마크/댓글 모두 적용. 서버 응답 실패 시 rollback

### 트러블슈팅
- **LoginModal 미렌더링**: `openLoginModal()` 호출해도 모달이 안 뜸 → `(main)/layout.tsx`에 `<LoginModal />` 마운트 누락이 원인

---

## Phase 5 — 검색 + 마이페이지

**날짜**: 2026-03-24

### 한 일
- 전체 텍스트 검색 (`search_posts()` PostgreSQL RPC)
- `ts_headline()`으로 키워드 하이라이트
- 검색어 디바운스 300ms (URL searchParams 방식 → 뒤로가기 지원)
- `/my/bookmarks`, `/my/posts` 페이지 (무한스크롤)
- Empty State 연동

### 주요 결정
- **URL searchParams 검색**: 검색어를 URL에 반영해 뒤로가기/공유/새로고침 시 상태 유지
- **FTS GIN 인덱스**: `003_indexes.sql`에서 미리 생성, `search_posts()` RPC가 이를 활용

---

## Phase 6 — Admin + Rate Limiting

**날짜**: 2026-03-24

### 한 일
- `/admin/posts`, `/admin/comments` 관리 페이지
- Admin 전용 라우트 보호 (proxy.ts)
- Rate Limiting Supabase Edge Function
- `rate_limits` 테이블 + 제한 기준: 게시글 5건/분, 댓글 10건/분, 좋아요 30건/분, 검색 30건/분

### 주요 결정
- **Edge Function으로 Rate Limit**: Next.js 미들웨어 대신 Supabase Edge Function 사용 → DB와 가깝게 배치해 레이턴시 최소화

---

## Phase 7 — 최적화 + 배포 준비

**날짜**: 2026-03-24

### 한 일
- `next.config.ts` Supabase Storage 이미지 remotePatterns 추가
- PostEditor dynamic import (`ssr: false`) — TipTap 번들 서버 번들 제외
- LoginModal dynamic import — `LoginModalDynamic.tsx` 래퍼 방식 (Next.js 16 제약)
- Suspense 경계: CommentList, PostActions
- OG 태그 강화: `metadataBase`, `openGraph` (layout.tsx, posts/[id])
- `app/robots.ts`, `app/sitemap.ts` (DB에서 게시글 동적 조회)
- `app/error.tsx`, `app/not-found.tsx`, `app/(main)/error.tsx`
- `npm run build` 성공 확인

### 트러블슈팅
- **Next.js 16 + Turbopack**: Server Component에서 `ssr: false` dynamic import 빌드 에러 → `'use client'` 래퍼 컴포넌트(`LoginModalDynamic.tsx`)를 사이에 두어 해결
- **Vercel pnpm 오감지**: `package-lock.json`이 있는 npm 프로젝트인데 Vercel이 pnpm으로 자동 감지 → `package.json`에 `"packageManager": "npm@..."` 추가 또는 Vercel 설정에서 Install Command 수동 지정

---

## 앞으로 추가할 수 있는 것들

- [ ] 알림 기능 (Supabase Realtime)
- [ ] SSO (Google / GitHub OAuth)
- [ ] 댓글 수정
- [ ] 게시글 신고
- [ ] 다크 모드
- [ ] 모바일 최적화

---

## 로그 작성 가이드

새 기능을 추가할 때마다 아래 형식으로 추가:

```markdown
## [기능명]

**날짜**: YYYY-MM-DD

### 한 일
- ...

### 주요 결정
- **결정 항목**: 내용. 이유.

### 트러블슈팅
- **문제**: 원인 → 해결
```

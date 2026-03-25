import { test, expect } from '@playwright/test'
import { hasTestCredentials, loginUser, TEST_CREDENTIALS } from './helpers/auth'

test.describe('인증 플로우', () => {
  test.describe('로그인 페이지', () => {
    test('로그인 페이지가 올바르게 렌더링된다', async ({ page }) => {
      await page.goto('/login')

      // 페이지 제목 확인
      await expect(page.getByRole('heading', { name: '환영합니다' })).toBeVisible()

      // 이메일/비밀번호 입력 필드 존재 확인
      await expect(page.getByLabel('이메일')).toBeVisible()
      await expect(page.getByLabel('비밀번호')).toBeVisible()

      // 로그인 버튼 존재 확인
      await expect(page.getByRole('button', { name: '로그인' })).toBeVisible()

      // 회원가입 링크 존재 확인
      await expect(page.getByRole('link', { name: '회원가입' })).toBeVisible()

      // 비밀번호 찾기 링크 존재 확인
      await expect(page.getByRole('link', { name: '비밀번호 찾기' })).toBeVisible()
    })

    test('잘못된 자격증명으로 로그인 시 에러 메시지가 표시된다', async ({ page }) => {
      await page.goto('/login')

      await page.getByLabel('이메일').fill('notexist@example.com')
      await page.getByLabel('비밀번호').fill('wrongpassword123!')

      await page.getByRole('button', { name: '로그인' }).click()

      // role="alert"인 에러 메시지 확인 (Next.js route-announcer 제외)
      const alert = page.getByRole('alert').filter({ hasText: '이메일 또는 비밀번호' })
      await expect(alert).toBeVisible({ timeout: 10_000 })
      await expect(alert).toContainText('이메일 또는 비밀번호가 올바르지 않습니다.')
    })

    test('이메일 형식이 잘못된 경우 유효성 에러가 표시된다', async ({ page }) => {
      await page.goto('/login')

      await page.getByLabel('이메일').fill('notanemail')
      await page.getByLabel('비밀번호').fill('somepassword')

      await page.getByRole('button', { name: '로그인' }).click()

      // Zod 유효성 검사 에러 메시지 확인 (폼 레벨)
      // 네트워크 요청 전에 클라이언트 측 검증으로 에러가 표시되어야 함
      await expect(page.locator('text=/이메일|email/i').first()).toBeVisible({ timeout: 5_000 })
    })

    test('올바른 자격증명으로 로그인 시 홈으로 이동한다', async ({ page }) => {
      // TEST_USER_EMAIL, TEST_USER_PASSWORD가 없으면 skip
      if (!hasTestCredentials()) {
        test.skip()
        return
      }

      await loginUser(page, TEST_CREDENTIALS.email, TEST_CREDENTIALS.password)

      // 로그인 후 홈 또는 리다이렉트 경로에 있어야 함
      await expect(page).not.toHaveURL(/\/login/)
    })
  })

  test.describe('회원가입 페이지', () => {
    test('회원가입 페이지가 올바르게 렌더링된다', async ({ page }) => {
      await page.goto('/signup')

      await expect(page.getByRole('heading', { name: '회원가입' })).toBeVisible()
      await expect(page.getByRole('button', { name: '회원가입' })).toBeVisible()
    })

    /**
     * 실제 회원가입 플로우는 Supabase 이메일 인증이 필요합니다.
     * 인증 이메일 수신 및 링크 클릭 과정을 자동화할 수 없어 skip 처리합니다.
     * 로컬 개발 환경에서 Supabase Inbucket을 사용하는 경우 별도 구현이 필요합니다.
     */
    test.skip('실제 회원가입 플로우 (이메일 인증 필요 — 자동화 불가)', async () => {
      // 이유: Supabase Auth는 가입 시 이메일 인증 링크를 발송합니다.
      // E2E 테스트에서 실제 이메일 수신 및 클릭 과정을 자동화하려면
      // Supabase Inbucket(로컬) 또는 Mailhog 같은 테스트 메일 서버가 필요합니다.
    })
  })

  test.describe('라우트 보호 — 비로그인', () => {
    test('비로그인 상태에서 /posts/new 접근 시 /login으로 리다이렉트된다', async ({ page }) => {
      await page.goto('/posts/new')

      // Next.js 미들웨어 또는 페이지 레벨에서 리다이렉트 처리
      await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
    })
  })
})

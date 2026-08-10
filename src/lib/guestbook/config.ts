import { verifyGuestbookSession } from '~/lib/github-oauth'
import { env } from '~/lib/runtime/shared'
import type { GuestbookUser } from '~/types/guestbook'

/** Admin GitHub logins, configured via env as a comma-separated list. */
export function isGuestbookAdmin(login: string | undefined | null): boolean {
  if (!login) return false
  const raw = env('GUESTBOOK_ADMIN_GITHUB_LOGINS') ?? ''
  const admins = raw
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
  return admins.includes(login.toLowerCase())
}

/** Auto-approve GitHub-authenticated entries unless explicitly disabled. */
export function isAutoApproveEnabled(): boolean {
  return env('GUESTBOOK_AUTO_APPROVE') !== 'false'
}

/** Resolve the signed-in user from the raw session cookie value. */
export function getGuestbookCurrentUser(
  cookieValue: string | undefined,
  nowSeconds: number,
): GuestbookUser | null {
  return verifyGuestbookSession(cookieValue, nowSeconds)
}

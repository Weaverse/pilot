import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { env } from '~/lib/runtime/shared'
import type { GuestbookUser } from '~/types/guestbook'

/**
 * GitHub OAuth + signed-session helpers for the guestbook.
 *
 * All secrets are server-only and read at runtime. `astro dev` loads `.env`
 * into `import.meta.env`; on Vercel the Function runtime injects real env into
 * `process.env`. Read both so the code works locally and in production. None of
 * these names are `PUBLIC_`-prefixed, so they never reach the client bundle.
 */
const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize'
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token'
const GITHUB_USER_URL = 'https://api.github.com/user'
/** 30 days in seconds — guestbook session lifetime. */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30
/** 10 minutes in seconds — OAuth `state` cookie lifetime. */
export const OAUTH_STATE_MAX_AGE = 60 * 10

export const SESSION_COOKIE = 'guestbook_session'
export const STATE_COOKIE = 'guestbook_oauth_state'

interface SessionPayload extends GuestbookUser {
  /** issued-at, unix seconds */
  iat: number
  /** expiry, unix seconds */
  exp: number
}

function getSessionSecret(): string {
  const secret = env('GUESTBOOK_SESSION_SECRET')
  if (!secret) {
    throw new Error('GUESTBOOK_SESSION_SECRET is not configured.')
  }
  return secret
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64url')
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8')
}

function sign(value: string): string {
  return createHmac('sha256', getSessionSecret())
    .update(value)
    .digest('base64url')
}

/** Constant-time comparison of two signatures. */
function signaturesMatch(a: string, b: string): boolean {
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)
  if (bufferA.length !== bufferB.length) return false
  return timingSafeEqual(bufferA, bufferB)
}

/**
 * Hash request metadata (IP, user-agent) with the session secret so we can
 * rate-limit without ever storing raw, personally-identifiable values.
 */
export function hashWithSecret(value: string): string {
  return createHmac('sha256', getSessionSecret()).update(value).digest('hex')
}

/** Build the GitHub authorize URL and the matching CSRF `state` token. */
export function createGithubAuthUrl(origin: string): {
  url: string
  state: string
} {
  const clientId = env('GITHUB_OAUTH_CLIENT_ID')
  if (!clientId) {
    throw new Error('GITHUB_OAUTH_CLIENT_ID is not configured.')
  }

  const state = randomBytes(16).toString('hex')
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${origin}/api/auth/github/callback`,
    scope: 'read:user',
    state,
    allow_signup: 'true',
  })

  return { url: `${GITHUB_AUTHORIZE_URL}?${params.toString()}`, state }
}

/** Exchange an OAuth `code` for an access token (server-side only). */
export async function exchangeGithubCode(
  code: string,
  origin: string,
): Promise<string> {
  const clientId = env('GITHUB_OAUTH_CLIENT_ID')
  const clientSecret = env('GITHUB_OAUTH_CLIENT_SECRET')
  if (!clientId || !clientSecret) {
    throw new Error('GitHub OAuth credentials are not configured.')
  }

  const response = await fetch(GITHUB_TOKEN_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${origin}/api/auth/github/callback`,
    }),
  })

  if (!response.ok) {
    throw new Error(`GitHub token exchange failed: ${response.status}`)
  }

  const data = (await response.json()) as {
    access_token?: string
    error?: string
  }
  if (!data.access_token) {
    throw new Error(`GitHub token exchange error: ${data.error ?? 'unknown'}`)
  }

  return data.access_token
}

/** Fetch the authenticated GitHub profile and map it to the session user. */
export async function fetchGithubViewer(
  accessToken: string,
): Promise<GuestbookUser> {
  const response = await fetch(GITHUB_USER_URL, {
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${accessToken}`,
      'user-agent': 'leohuynh.dev-guestbook',
    },
  })

  if (!response.ok) {
    throw new Error(`GitHub profile fetch failed: ${response.status}`)
  }

  const profile = (await response.json()) as {
    id: number
    login: string
    name: string | null
    avatar_url: string | null
  }

  return {
    id: profile.id,
    login: profile.login,
    name: profile.name ?? null,
    avatarUrl: profile.avatar_url ?? null,
  }
}

/** Sign a minimal user object into a `payload.signature` cookie value. */
export function signGuestbookSession(
  user: GuestbookUser,
  nowSeconds: number,
): string {
  const payload: SessionPayload = {
    ...user,
    iat: nowSeconds,
    exp: nowSeconds + SESSION_MAX_AGE,
  }
  const encoded = base64UrlEncode(JSON.stringify(payload))
  return `${encoded}.${sign(encoded)}`
}

/** Verify a session cookie value and return the user, or null if invalid. */
export function verifyGuestbookSession(
  cookieValue: string | undefined,
  nowSeconds: number,
): GuestbookUser | null {
  if (!cookieValue) return null
  const [encoded, signature] = cookieValue.split('.')
  if (!encoded || !signature) return null
  if (!signaturesMatch(signature, sign(encoded))) return null

  try {
    const payload = JSON.parse(base64UrlDecode(encoded)) as SessionPayload
    if (typeof payload.exp !== 'number' || payload.exp < nowSeconds) return null
    if (typeof payload.id !== 'number' || typeof payload.login !== 'string') {
      return null
    }
    return {
      id: payload.id,
      login: payload.login,
      name: payload.name ?? null,
      avatarUrl: payload.avatarUrl ?? null,
    }
  } catch {
    return null
  }
}

/** Sign a short-lived OAuth `state` value for CSRF protection. */
export function signOAuthState(state: string): string {
  return `${state}.${sign(state)}`
}

/** Verify a signed OAuth `state` cookie against the value GitHub echoed back. */
export function verifyOAuthState(
  cookieValue: string | undefined,
  returnedState: string | null,
): boolean {
  if (!cookieValue || !returnedState) return false
  const [state, signature] = cookieValue.split('.')
  if (!state || !signature) return false
  if (!signaturesMatch(signature, sign(state))) return false
  return signaturesMatch(state, returnedState)
}

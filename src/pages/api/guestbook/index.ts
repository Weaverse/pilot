import type { APIRoute } from 'astro'
import { SESSION_COOKIE } from '~/lib/github-oauth'
import {
  getGuestbookCurrentUser,
  isGuestbookAdmin,
} from '~/lib/guestbook/config'
import { clampLimit } from '~/lib/guestbook/cursor'
import {
  createGuestbookEntry,
  getGuestbookEntries,
} from '~/lib/guestbook/queries'
import { buildRequestMeta } from '~/lib/guestbook/request-meta'

export const prerender = false

const JSON_HEADERS = {
  'cache-control': 'no-store',
  'content-type': 'application/json; charset=utf-8',
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: JSON_HEADERS })
}

function jsonError(status: number, message: string) {
  return json({ message }, status)
}

function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || null
  return request.headers.get('x-real-ip')
}

/** Public: list approved entries (all statuses for admins) with keyset paging. */
export const GET: APIRoute = async ({ url, cookies }) => {
  const nowSeconds = Math.floor(Date.now() / 1000)
  const viewer = getGuestbookCurrentUser(
    cookies.get(SESSION_COOKIE)?.value,
    nowSeconds,
  )
  const isAdmin = isGuestbookAdmin(viewer?.login)

  try {
    const result = await getGuestbookEntries({
      cursor: url.searchParams.get('cursor'),
      limit: clampLimit(url.searchParams.get('limit')),
      viewer,
      isAdmin,
    })
    return json(result)
  } catch (error) {
    console.error('[api/guestbook] GET', error)
    return jsonError(503, 'Guestbook is unavailable.')
  }
}

/** Authenticated: create an entry. Server owns the GitHub identity fields. */
export const POST: APIRoute = async ({ request, cookies }) => {
  const nowSeconds = Math.floor(Date.now() / 1000)
  const user = getGuestbookCurrentUser(
    cookies.get(SESSION_COOKIE)?.value,
    nowSeconds,
  )
  if (!user) return jsonError(401, 'Sign in with GitHub to leave a note.')

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return jsonError(400, 'Invalid JSON body.')
  }

  // Honeypot: a filled `website` means a bot. Return a success-looking 204 so
  // we don't teach scrapers what tripped the trap.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return new Response(null, { status: 204 })
  }

  try {
    const meta = buildRequestMeta(
      getClientIp(request),
      request.headers.get('user-agent'),
      nowSeconds,
    )
    const result = await createGuestbookEntry(
      {
        message: body.message,
        displayName: body.displayName,
        signature: body.signature,
      },
      user,
      meta,
    )

    if (!result.ok) return jsonError(result.status, result.message)
    return json({ entry: result.entry, status: result.status }, 201)
  } catch (error) {
    console.error('[api/guestbook] POST', error)
    return jsonError(503, 'Could not save your note. Try again later.')
  }
}

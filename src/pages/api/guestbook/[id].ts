import type { APIRoute } from 'astro'
import { SESSION_COOKIE } from '~/lib/github-oauth'
import {
  getGuestbookCurrentUser,
  isGuestbookAdmin,
} from '~/lib/guestbook/config'
import { moderateGuestbookEntry } from '~/lib/guestbook/queries'

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

/** Admin-only soft moderation. No DELETE in v1. */
export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  const nowSeconds = Math.floor(Date.now() / 1000)
  const user = getGuestbookCurrentUser(
    cookies.get(SESSION_COOKIE)?.value,
    nowSeconds,
  )
  if (!user || !isGuestbookAdmin(user.login)) {
    return jsonError(403, 'Not allowed.')
  }

  const id = params.id
  if (!id) return jsonError(400, 'Missing entry id.')

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return jsonError(400, 'Invalid JSON body.')
  }

  const status = body.status
  if (status !== 'approved' && status !== 'hidden') {
    return jsonError(400, 'Status must be `approved` or `hidden`.')
  }

  try {
    const entry = await moderateGuestbookEntry(id, status, user.login)
    if (!entry) return jsonError(404, 'Entry not found.')
    return json({ entry })
  } catch (error) {
    console.error('[api/guestbook/:id] PATCH', error)
    return jsonError(503, 'Could not update the entry.')
  }
}

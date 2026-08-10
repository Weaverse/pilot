import type { APIRoute } from 'astro'
import { fetchActivity } from '~/lib/runtime/activity'
import { jsonHeaders } from '~/lib/runtime/shared'

export const prerender = false

export const GET: APIRoute = async () => {
  const payload = await fetchActivity()
  return Response.json(payload, { headers: jsonHeaders(120) })
}

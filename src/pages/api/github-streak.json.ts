import type { APIRoute } from 'astro'
import { fetchGithubStreak } from '~/lib/runtime/github/streak'
import { jsonHeaders } from '~/lib/runtime/shared'

export const prerender = false

export const GET: APIRoute = async () => {
  const payload = await fetchGithubStreak()
  return Response.json(payload, { headers: jsonHeaders(86_400) })
}

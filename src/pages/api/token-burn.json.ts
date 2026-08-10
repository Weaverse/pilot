import type { APIRoute } from 'astro'
import { jsonHeaders } from '~/lib/runtime/shared'
import { fetchTokenBurn, fetchTokenBurnFull } from '~/lib/runtime/token-burn'

export const prerender = false

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url)
  const payload =
    url.searchParams.get('view') === 'full'
      ? await fetchTokenBurnFull()
      : await fetchTokenBurn()
  // token-burn data changes ~once/day per machine — cache generously.
  return Response.json(payload, { headers: jsonHeaders(600) })
}

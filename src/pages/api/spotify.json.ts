import type { APIRoute } from 'astro'
import { noStoreJsonHeaders } from '~/lib/runtime/shared'
import { fetchSpotifyStatus } from '~/lib/runtime/spotify'

export const prerender = false

export const GET: APIRoute = async () => {
  const payload = await fetchSpotifyStatus()
  return Response.json(payload, { headers: noStoreJsonHeaders() })
}

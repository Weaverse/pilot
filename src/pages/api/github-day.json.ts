import type { APIRoute } from 'astro'
import { fetchGithubDay } from '~/lib/runtime/github/day'
import { githubHeatmapDateWindow } from '~/lib/runtime/hanoi-date'
import { jsonHeaders } from '~/lib/runtime/shared'

export const prerender = false

function isRealIsoDate(date: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const normalized = new Date(Date.UTC(year, month - 1, day))
  return (
    normalized.getUTCFullYear() === year &&
    normalized.getUTCMonth() === month - 1 &&
    normalized.getUTCDate() === day
  )
}

export const GET: APIRoute = async ({ url }) => {
  const date = url.searchParams.get('date')
  if (!date) {
    return Response.json(
      { ok: false, error: 'Missing date query parameter.' },
      { status: 400, headers: jsonHeaders(60) },
    )
  }

  if (!isRealIsoDate(date)) {
    return Response.json(
      { ok: false, date, error: 'Invalid calendar date.' },
      { status: 400, headers: jsonHeaders(60) },
    )
  }

  const window = githubHeatmapDateWindow()
  if (date < window.fromDate || date > window.toDate) {
    return Response.json(
      {
        ok: false,
        date,
        error: `Date must be within ${window.fromDate} and ${window.toDate}.`,
      },
      { status: 400, headers: jsonHeaders(60) },
    )
  }

  const payload = await fetchGithubDay(date)
  return Response.json(payload, { headers: jsonHeaders(86_400) })
}

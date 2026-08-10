import type { APIRoute } from 'astro'
import { getSql } from '~/lib/db'

type StatsType = 'blog' | 'snippet'
type StatsField = 'views' | 'loves' | 'applauses' | 'ideas' | 'bullseyes'

interface StatsRow extends Record<StatsField, number> {
  type: StatsType
  slug: string
}

const STATS_FIELDS: StatsField[] = [
  'views',
  'loves',
  'applauses',
  'ideas',
  'bullseyes',
]
const JSON_HEADERS = {
  'cache-control': 'no-store',
  'content-type': 'application/json; charset=utf-8',
}

function parseType(value: string | undefined): StatsType | null {
  return value === 'blog' || value === 'snippet' ? value : null
}

function parseSlug(value: string | undefined): string | null {
  const slug = value?.trim()
  if (!slug || slug.length > 255) return null
  return slug
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: JSON_HEADERS })
}

function jsonError(status: number, message: string) {
  return json({ message }, status)
}

function normalizeCount(value: unknown): number | undefined {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return undefined
  return Math.max(0, Math.floor(numberValue))
}

async function ensureStats(type: StatsType, slug: string): Promise<StatsRow> {
  const db = getSql()

  await db`
    insert into stats (type, slug)
    values (${type}, ${slug})
    on conflict (type, slug) do nothing
  `

  const [row] = await db<StatsRow[]>`
    select type, slug, views, loves, applauses, ideas, bullseyes
    from stats
    where type = ${type} and slug = ${slug}
    limit 1
  `

  return row
}

export const prerender = false

export const GET: APIRoute = async ({ url }) => {
  const type = parseType(url.searchParams.get('type') ?? undefined)
  const slug = parseSlug(url.searchParams.get('slug') ?? undefined)

  if (!type || !slug) {
    return jsonError(400, 'Missing or invalid `type` or `slug` parameter!')
  }

  try {
    const row = await ensureStats(type, slug)
    return json(row)
  } catch (error) {
    console.error('[api/stats]', error)
    return jsonError(503, 'Stats service unavailable.')
  }
}

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return jsonError(400, 'Invalid JSON body.')
  }

  const type = parseType(typeof body.type === 'string' ? body.type : undefined)
  const slug = parseSlug(typeof body.slug === 'string' ? body.slug : undefined)

  if (!type || !slug) {
    return jsonError(400, 'Missing or invalid `type` or `slug` parameter!')
  }

  try {
    const current = await ensureStats(type, slug)
    const next: StatsRow = { ...current }

    for (const field of STATS_FIELDS) {
      const value = normalizeCount(body[field])
      if (value !== undefined) next[field] = Math.max(current[field], value)
    }

    const db = getSql()
    const [updated] = await db<StatsRow[]>`
      update stats
      set
        views = ${next.views},
        loves = ${next.loves},
        applauses = ${next.applauses},
        ideas = ${next.ideas},
        bullseyes = ${next.bullseyes}
      where type = ${type} and slug = ${slug}
      returning type, slug, views, loves, applauses, ideas, bullseyes
    `

    return json(updated)
  } catch (error) {
    console.error('[api/stats]', error)
    return jsonError(503, 'Stats service unavailable.')
  }
}

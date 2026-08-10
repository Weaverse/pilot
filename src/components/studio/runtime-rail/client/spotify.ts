import type { SpotifyPayload } from '~/types/integrations'
import { fetchRuntimeJson } from './shared'

function spotifyStatusLabel(
  status: SpotifyPayload['status'] | undefined,
): string {
  return status || 'unavailable'
}

function spotifyHeading(status: SpotifyPayload['status'] | undefined): string {
  return status === 'playing' ? 'audio: live' : 'audio: idle'
}

function spotifyTimeAgo(playedAt: string | null | undefined): string {
  if (!playedAt) return 'last played'
  const then = new Date(playedAt).getTime()
  if (Number.isNaN(then)) return 'last played'
  const secs = Math.floor(Math.max(0, Date.now() - then) / 1000)
  const ago = (value: number, unit: string) =>
    `${value} ${unit}${value === 1 ? '' : 's'} ago`
  if (secs < 60) return 'just now'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return ago(mins, 'minute')
  const hours = Math.floor(mins / 60)
  if (hours < 24) return ago(hours, 'hour')
  const days = Math.floor(hours / 24)
  if (days < 7) return ago(days, 'day')
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return ago(weeks, 'week')
  const months = Math.floor(days / 30)
  if (months < 12) return ago(months, 'month')
  return ago(Math.floor(days / 365), 'year')
}

function updateSpotify(rail: Element, spotify: SpotifyPayload | null) {
  const song = spotify?.song
  const image = rail.querySelector<HTMLImageElement>('[data-spotify-image]')
  const placeholder = rail.querySelector<HTMLElement>(
    '[data-spotify-placeholder]',
  )
  const link = rail.querySelector<HTMLAnchorElement>(
    '[data-spotify-title-link]',
  )
  const empty = rail.querySelector<HTMLElement>('[data-spotify-empty]')
  const artist = rail.querySelector<HTMLElement>('[data-spotify-artist]')
  const status = rail.querySelector<HTMLElement>('[data-spotify-status]')
  const heading = rail.querySelector<HTMLElement>('[data-spotify-heading]')
  const eq = rail.querySelector<HTMLElement>('[data-spotify-eq]')

  if (image && placeholder) {
    if (song?.albumImageUrl) {
      image.src = song.albumImageUrl
      image.alt = song.album || song.title || ''
      image.classList.remove('hidden')
      placeholder.classList.add('hidden')
    } else {
      image.classList.add('hidden')
      placeholder.classList.remove('hidden')
    }
  }

  if (link && empty) {
    if (song?.songUrl && song.title) {
      link.href = song.songUrl
      link.textContent = song.title
      link.classList.remove('hidden')
      link.classList.add('block')
      empty.hidden = true
    } else {
      link.classList.add('hidden')
      link.classList.remove('block')
      empty.hidden = false
    }
  }

  if (artist)
    artist.textContent = song
      ? song.artist || ''
      : spotifyStatusLabel(spotify?.status)
  if (status) {
    const state = spotify?.status
    if (state === 'playing') {
      status.textContent = 'now playing'
    } else if (state === 'recently-played') {
      status.textContent = `last played · ${spotifyTimeAgo(song?.playedAt)}`
    } else {
      status.textContent = spotifyStatusLabel(state)
    }
  }
  if (heading) heading.textContent = spotifyHeading(spotify?.status)
  if (eq) eq.classList.toggle('is-playing', spotify?.status === 'playing')
}

export async function refreshSpotify(rail: Element) {
  const spotify = await fetchRuntimeJson<SpotifyPayload>('/api/spotify.json', {
    cache: 'no-store',
  })
  updateSpotify(rail, spotify)
}

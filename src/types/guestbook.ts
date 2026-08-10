/**
 * Shared public DTO types for the guestbook feature. These shapes are what the
 * API returns to the browser — they intentionally exclude internal columns like
 * `ip_hash` / `user_agent_hash` so abuse-control data never leaks to clients.
 */

export type GuestbookStatus = 'pending' | 'approved' | 'hidden'

/** A drawn signature, normalized to a fixed 0..1000 coordinate space. */
export interface GuestbookSignature {
  width: number
  height: number
  strokes: Array<Array<[number, number]>>
}

/** The minimal GitHub identity persisted in the signed session cookie. */
export interface GuestbookUser {
  id: number
  login: string
  name: string | null
  avatarUrl: string | null
}

/** Public representation of one guestbook entry. */
export interface GuestbookEntry {
  id: string
  displayName: string
  githubLogin: string
  githubAvatarUrl: string | null
  message: string
  signature: GuestbookSignature | null
  status: GuestbookStatus
  createdAt: string
  isOwnEntry?: boolean
}

export interface GuestbookListResponse {
  entries: GuestbookEntry[]
  nextCursor: string | null
}

export interface CreateGuestbookResponse {
  entry: GuestbookEntry
  status: 'approved' | 'pending'
}

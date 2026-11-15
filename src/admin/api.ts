/** Thin client for the PHP API in /server/api. Same origin, cookie session. */

export type Status = 'interested' | 'registered'
/** List filter: a status, everything live (''), or the soft-deleted bin. */
export type Filter = Status | '' | 'deleted'

export interface User {
  id: number
  name: string
  username: string | null
  email: string | null
  role: 'superadmin' | 'admin'
}

export interface ParticipantRow {
  id: number
  full_name: string
  email: string
  phone: string
  city: string | null
  role: string | null
  organization: string | null
  status: Status
  photo_url: string | null
  created_at: string
  deleted_at: string | null
}

export interface Participant extends ParticipantRow {
  experience: string | null
  social: string | null
  previous_competition: string | null
  heard_from: string | null
  tshirt_size: string | null
  bio: string | null
  press_consent: number | string
  payment_confirmed_at: string | null
  notes: string | null
  status_changed_at: string | null
  changed_by_name: string | null
  deleted_by_name: string | null
  updated_at: string
}

export interface ParticipantList {
  rows: ParticipantRow[]
  counts: { all: number; interested: number; registered: number; deleted: number }
  total: number
  page: number
  pages: number
  per_page: number
}

export type SponsorStatus = 'new' | 'contacted'

export interface SponsorInquiry {
  id: number
  name: string
  contact: string
  email: string | null
  company: string | null
  interest: string | null
  status: SponsorStatus
  notes: string | null
  created_at: string
}

export interface SponsorList {
  rows: SponsorInquiry[]
  counts: { all: number; new: number; contacted: number }
  total: number
  page: number
  pages: number
  per_page: number
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

let csrf = ''
/** Called on any 401 so the app can drop back to the login screen. */
let onUnauthorized: () => void = () => {}
export const setUnauthorizedHandler = (fn: () => void) => {
  onUnauthorized = fn
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body) headers.set('Content-Type', 'application/json')
  if (init.method && init.method !== 'GET') headers.set('X-CSRF-Token', csrf)

  let res: Response
  try {
    res = await fetch(`/api/${path}`, { ...init, headers, credentials: 'same-origin' })
  } catch {
    throw new ApiError(0, 'Can’t reach the server. Is the PHP API running?')
  }
  const data = await res.json().catch(() => null)
  if (!res.ok || !data?.ok) {
    if (res.status === 401 && path !== 'auth.php') onUnauthorized()
    throw new ApiError(res.status, data?.error ?? `Request failed (${res.status})`)
  }
  if (typeof data.csrf === 'string') csrf = data.csrf
  return data as T
}

export const api = {
  session: () => request<{ user: User | null; csrf: string }>('auth.php'),
  login: (login: string, password: string) =>
    request<{ user: User; csrf: string }>('auth.php', {
      method: 'POST',
      body: JSON.stringify({ action: 'login', login, password }),
    }),
  logout: () => request('auth.php', { method: 'POST', body: JSON.stringify({ action: 'logout' }) }),

  participants: (params: { status?: Filter; q?: string; page?: number }) => {
    const qs = new URLSearchParams()
    if (params.status) qs.set('status', params.status)
    if (params.q) qs.set('q', params.q)
    if (params.page && params.page > 1) qs.set('page', String(params.page))
    return request<ParticipantList>(`participants.php?${qs}`)
  },
  participant: (id: number) => request<{ participant: Participant }>(`participant.php?id=${id}`),
  updateParticipant: (id: number, body: { status: Status; notes: string }) => act(id, { action: 'update', ...body }),
  setStatus: (id: number, status: Status) => act(id, { action: 'status', status }),
  /** Soft delete: hidden from the lists, restorable from the Deleted tab. */
  deleteParticipant: (id: number) => act(id, { action: 'delete' }),
  restoreParticipant: (id: number) => act(id, { action: 'restore' }),

  sponsorInquiries: (params: { status?: SponsorStatus | ''; q?: string; page?: number }) => {
    const qs = new URLSearchParams()
    if (params.status) qs.set('status', params.status)
    if (params.q) qs.set('q', params.q)
    if (params.page && params.page > 1) qs.set('page', String(params.page))
    return request<SponsorList>(`sponsor-inquiries.php?${qs}`)
  },
  updateSponsorInquiry: (id: number, status: SponsorStatus, notes: string) =>
    request('sponsor-inquiries.php', { method: 'POST', body: JSON.stringify({ id, action: 'update', status, notes }) }),
  deleteSponsorInquiry: (id: number) =>
    request('sponsor-inquiries.php', { method: 'POST', body: JSON.stringify({ id, action: 'delete' }) }),
}

function act(id: number, body: Record<string, string>) {
  return request<{ participant: Participant }>(`participant.php?id=${id}`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export const statusLabel: Record<Status, string> = { interested: 'Interested', registered: 'Registered' }

export function fmtDate(d: string | null): string {
  if (!d) return '—'
  return new Date(d.replace(' ', 'T')).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

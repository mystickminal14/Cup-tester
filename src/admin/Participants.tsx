import { ArchiveRestore, Check, ChevronLeft, ChevronRight, Eye, Loader2, Search, Trash2, Undo2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api, fmtDate, statusLabel, type Filter, type ParticipantList, type ParticipantRow } from './api'
import { useConfirm } from './ConfirmDialog'
import { StatusBadge } from './StatusBadge'
import { linkClick, navigate, useLocation } from './router'

const tabs: { key: Filter; label: string; count: keyof ParticipantList['counts'] }[] = [
  { key: '', label: 'All', count: 'all' },
  { key: 'interested', label: statusLabel.interested, count: 'interested' },
  { key: 'registered', label: statusLabel.registered, count: 'registered' },
  { key: 'deleted', label: 'Deleted', count: 'deleted' },
]

/** Filters live in the URL so the back button and refresh keep them. */
function readParams(search: string) {
  const p = new URLSearchParams(search)
  const s = p.get('status')
  return {
    status: (s === 'interested' || s === 'registered' || s === 'deleted' ? s : '') as Filter,
    q: p.get('q') ?? '',
    page: Math.max(1, Number(p.get('page')) || 1),
  }
}

function toUrl(params: { status: Filter; q: string; page: number }) {
  const p = new URLSearchParams()
  if (params.status) p.set('status', params.status)
  if (params.q) p.set('q', params.q)
  if (params.page > 1) p.set('page', String(params.page))
  const qs = p.toString()
  return `/admin${qs ? `?${qs}` : ''}`
}

export function Participants({ canDelete }: { canDelete: boolean }) {
  const location = useLocation()
  const params = readParams(location.split('?')[1] ?? '')
  const [data, setData] = useState<ParticipantList | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState(params.q)
  const [reload, setReload] = useState(0)
  /** id of the row whose action is in flight */
  const [busy, setBusy] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [confirm, dialog] = useConfirm()

  useEffect(() => {
    let live = true
    setLoading(true)
    api
      .participants(params)
      .then((d) => live && (setData(d), setError(null)))
      .catch((e: Error) => live && setError(e.message))
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.status, params.q, params.page, reload])

  // Debounced search → URL.
  useEffect(() => {
    if (query === params.q) return
    const t = setTimeout(() => navigate(toUrl({ ...params, q: query.trim(), page: 1 })), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const run = async (row: ParticipantRow, action: () => Promise<unknown>, done: string) => {
    setBusy(row.id)
    try {
      await action()
      setToast(done)
      setReload((n) => n + 1)
    } catch (e) {
      setToast((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const toggleStatus = async (r: ParticipantRow) => {
    const next = r.status === 'interested' ? 'registered' : 'interested'
    const ok = await confirm(
      next === 'registered'
        ? {
            title: `Mark ${r.full_name} as registered?`,
            message: 'Only do this once their payment is confirmed.',
            confirmLabel: 'Mark registered',
            tone: 'success',
          }
        : {
            title: `Move ${r.full_name} back to interested?`,
            message: 'Use this if their payment hasn’t arrived.',
            confirmLabel: 'Mark interested',
            tone: 'warning',
          },
    )
    if (ok) run(r, () => api.setStatus(r.id, next), `${r.full_name} marked ${statusLabel[next].toLowerCase()}.`)
  }
  const remove = async (r: ParticipantRow) => {
    const ok = await confirm({
      title: `Delete ${r.full_name}?`,
      message: 'They’ll move to the Deleted tab, where you can restore them.',
      confirmLabel: 'Delete',
      tone: 'danger',
    })
    if (ok) run(r, () => api.deleteParticipant(r.id), `${r.full_name} moved to Deleted.`)
  }
  const restore = async (r: ParticipantRow) => {
    const ok = await confirm({
      title: `Restore ${r.full_name}?`,
      message: 'They’ll be back in the participant lists.',
      confirmLabel: 'Restore',
      tone: 'neutral',
    })
    if (ok) run(r, () => api.restoreParticipant(r.id), `${r.full_name} restored.`)
  }

  const counts = data?.counts
  const inBin = params.status === 'deleted'

  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Total" value={counts?.all} className="col-span-2 sm:col-span-1" />
        <Stat label="Interested" value={counts?.interested} hint="Awaiting payment" />
        <Stat label="Registered" value={counts?.registered} hint="Payment confirmed" />
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3.5 dark:border-zinc-800">
          <div className="inline-flex max-w-full gap-0.5 overflow-x-auto rounded-[9px] bg-zinc-100 p-[3px] dark:bg-zinc-950">
            {tabs.filter((t) => canDelete || t.key !== 'deleted').map((t) => {
              const on = params.status === t.key
              return (
                <a
                  key={t.key}
                  href={toUrl({ ...params, status: t.key, page: 1 })}
                  onClick={linkClick}
                  className={`rounded-[7px] px-3 py-1.5 font-medium whitespace-nowrap transition-colors ${
                    on
                      ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-zinc-50'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                  }`}
                >
                  {t.key === 'deleted' && <Trash2 size={13} className="mr-1 -mt-0.5 inline" />}
                  {t.label}
                  <span className="ml-1.5 text-xs text-zinc-400 tabular-nums">{counts?.[t.count] ?? '·'}</span>
                </a>
              )
            })}
          </div>
          <label className="relative w-full sm:w-72">
            <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, phone…"
              aria-label="Search participants"
              className="input pl-9"
            />
          </label>
        </div>

        {error ? (
          <p className="px-4 py-12 text-center text-red-600 dark:text-red-400">{error}</p>
        ) : !data ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="animate-spin text-zinc-400" />
          </div>
        ) : data.rows.length === 0 ? (
          <p className="px-4 py-12 text-center text-zinc-500 dark:text-zinc-400">
            {params.q
              ? 'No participants match your search.'
              : inBin
                ? 'Nothing deleted.'
                : 'No participants yet. Registrations from the website will appear here.'}
          </p>
        ) : (
          <>
            <div className={`overflow-x-auto transition-opacity ${loading ? 'opacity-50' : ''}`}>
              <table className="w-full min-w-[960px] border-collapse text-left">
                <thead>
                  <tr className="bg-zinc-50 text-xs font-semibold text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                    <th className="w-14 border-b border-zinc-200 px-4 py-2.5 whitespace-nowrap dark:border-zinc-800">S.N.</th>
                    {['Name', 'Contact', 'City', 'Role', inBin ? 'Deleted' : 'Submitted', 'Status'].map((h) => (
                      <th key={h} className="border-b border-zinc-200 px-4 py-2.5 whitespace-nowrap dark:border-zinc-800">
                        {h}
                      </th>
                    ))}
                    <th className="border-b border-zinc-200 px-4 py-2.5 text-right dark:border-zinc-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r, i) => (
                    <tr
                      key={r.id}
                      className={`border-b border-zinc-200 align-middle transition-colors last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50 ${
                        inBin ? 'text-zinc-500 dark:text-zinc-400' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-zinc-500 tabular-nums dark:text-zinc-400">{(data.page - 1) * data.per_page + i + 1}</td>
                      <td className="px-4 py-3">
                        <a href={`/admin/participants/${r.id}`} onClick={linkClick} className="flex items-center gap-2.5">
                          <Avatar name={r.full_name} src={r.photo_url} />
                          <span className="min-w-0">
                            <strong className="block font-semibold hover:underline">{r.full_name}</strong>
                            {r.organization && <span className="block text-xs text-zinc-500 dark:text-zinc-400">{r.organization}</span>}
                          </span>
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <a href={`tel:${r.phone}`} className="block hover:underline">
                          {r.phone}
                        </a>
                        <a href={`mailto:${r.email}`} className="block text-xs text-zinc-500 hover:underline dark:text-zinc-400">
                          {r.email}
                        </a>
                      </td>
                      <td className="px-4 py-3">{r.city ?? '—'}</td>
                      <td className="px-4 py-3">{r.role ?? '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{fmtDate(inBin ? r.deleted_at : r.created_at)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {busy === r.id && <Loader2 size={15} className="animate-spin text-zinc-400" />}
                          <a href={`/admin/participants/${r.id}`} onClick={linkClick} className="btn btn-xs" title="View details">
                            <Eye size={14} /> View
                          </a>
                          {inBin ? (
                            <button className="btn btn-xs" disabled={busy === r.id} onClick={() => restore(r)}>
                              <ArchiveRestore size={14} /> Restore
                            </button>
                          ) : (
                            <>
                              {r.status === 'interested' ? (
                                <button
                                  className="btn btn-xs border-green-200 text-green-700 hover:bg-green-50 dark:border-green-900 dark:text-green-400 dark:hover:bg-green-950/50"
                                  disabled={busy === r.id}
                                  onClick={() => toggleStatus(r)}
                                  title="Payment confirmed"
                                >
                                  <Check size={14} /> Mark registered
                                </button>
                              ) : (
                                <button
                                  className="btn btn-xs border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-400 dark:hover:bg-amber-950/50"
                                  disabled={busy === r.id}
                                  onClick={() => toggleStatus(r)}
                                  title="Move back to interested"
                                >
                                  <Undo2 size={14} /> Mark interested
                                </button>
                              )}
                              {canDelete && (
                              <button
                                className="btn btn-xs text-red-600 hover:border-red-200 hover:bg-red-50 dark:text-red-400 dark:hover:border-red-900 dark:hover:bg-red-950/50"
                                disabled={busy === r.id}
                                onClick={() => remove(r)}
                                title="Delete (can be restored)"
                                aria-label={`Delete ${r.full_name}`}
                              >
                                <Trash2 size={14} />
                              </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <span className="text-zinc-500 dark:text-zinc-400">
                {data.total} participant{data.total === 1 ? '' : 's'} · page {data.page} of {data.pages}
              </span>
              <span className="flex gap-1.5">
                <button
                  className="btn"
                  disabled={data.page <= 1}
                  onClick={() => navigate(toUrl({ ...params, page: data.page - 1 }))}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  className="btn"
                  disabled={data.page >= data.pages}
                  onClick={() => navigate(toUrl({ ...params, page: data.page + 1 }))}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </span>
            </div>
          </>
        )}
      </div>

      {toast && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-lg bg-zinc-900 px-4 py-2.5 font-medium text-white shadow-lg dark:bg-zinc-50 dark:text-zinc-900"
        >
          {toast}
        </div>
      )}
      {dialog}
    </>
  )
}

function Stat({ label, value, hint, className = '' }: { label: string; value?: number; hint?: string; className?: string }) {
  return (
    <div className={`rounded-xl border border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <span className="text-[12.5px] font-medium text-zinc-500 dark:text-zinc-400">{label}</span>
      <strong className="mt-0.5 block text-[28px] leading-tight font-bold tracking-tight tabular-nums">{value ?? '–'}</strong>
      {hint && <span className="block text-xs text-zinc-500 dark:text-zinc-400">{hint}</span>}
    </div>
  )
}

export function Avatar({ name, src, size = 32 }: { name: string; src: string | null; size?: number }) {
  return src ? (
    <img src={src} alt="" width={size} height={size} className="shrink-0 rounded-full bg-zinc-100 object-cover dark:bg-zinc-800" style={{ width: size, height: size }} />
  ) : (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-zinc-100 font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  )
}

import { Check, ChevronLeft, ChevronRight, Loader2, NotebookPen, Search, Trash2, Undo2 } from 'lucide-react'
import { Fragment, useEffect, useState } from 'react'
import { useConfirm } from './ConfirmDialog'
import { api, fmtDate, type SponsorInquiry, type SponsorList, type SponsorStatus } from './api'

const tabs: { key: SponsorStatus | ''; label: string; count: keyof SponsorList['counts'] }[] = [
  { key: '', label: 'All', count: 'all' },
  { key: 'new', label: 'New', count: 'new' },
  { key: 'contacted', label: 'Contacted', count: 'contacted' },
]

function Badge({ status }: { status: SponsorStatus }) {
  const cls =
    status === 'new'
      ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
      : 'bg-green-50 text-green-600 dark:bg-green-950/60 dark:text-green-400'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status === 'new' ? 'New' : 'Contacted'}
    </span>
  )
}

/** Notes box that saves on blur. */
function Notes({ row, onSave }: { row: SponsorInquiry; onSave: (notes: string) => void }) {
  const [v, setV] = useState(row.notes ?? '')
  return (
    <textarea
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => v !== (row.notes ?? '') && onSave(v)}
      rows={2}
      placeholder="Notes (saved when you click away)"
      className="input resize-y text-[13px]"
    />
  )
}

export function SponsorInquiries({ canDelete }: { canDelete: boolean }) {
  const [status, setStatus] = useState<SponsorStatus | ''>('')
  const [query, setQuery] = useState('')
  const [q, setQ] = useState('')
  const [data, setData] = useState<SponsorList | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [reload, setReload] = useState(0)
  const [busy, setBusy] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [notesOpen, setNotesOpen] = useState<number | null>(null)
  const [confirm, dialog] = useConfirm()

  const setRowStatus = async (r: SponsorInquiry, next: SponsorStatus) => {
    const ok = await confirm(
      next === 'contacted'
        ? { title: `Mark ${r.name} as contacted?`, message: 'Do this once someone from the team has reached them.', confirmLabel: 'Mark contacted', tone: 'success' }
        : { title: `Move ${r.name} back to new?`, message: 'It will show as not yet contacted.', confirmLabel: 'Mark new', tone: 'warning' },
    )
    if (ok) run(r.id, () => api.updateSponsorInquiry(r.id, next, r.notes ?? ''), next === 'contacted' ? `${r.name} marked contacted.` : `${r.name} moved back to new.`)
  }
  const removeRow = async (r: SponsorInquiry) => {
    const ok = await confirm({
      title: `Delete the enquiry from ${r.name}?`,
      message: 'This is permanent and can’t be undone.',
      confirmLabel: 'Delete',
      tone: 'danger',
    })
    if (ok) run(r.id, () => api.deleteSponsorInquiry(r.id), 'Enquiry deleted.')
  }

  useEffect(() => {
    const t = setTimeout(() => {
      setQ(query.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    let live = true
    setLoading(true)
    api
      .sponsorInquiries({ status, q, page })
      .then((d) => live && (setData(d), setError(null)))
      .catch((e: Error) => live && setError(e.message))
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [status, q, page, reload])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const run = async (id: number, action: () => Promise<unknown>, done: string) => {
    setBusy(id)
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

  const counts = data?.counts

  return (
    <>
      <div className="mb-4 grid grid-cols-3 gap-3">
        {tabs.map((t) => (
          <div key={t.key} className="rounded-xl border border-zinc-200 bg-white px-4 py-3.5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400">{t.key ? t.label : 'Total'}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{counts?.[t.count] ?? '–'}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3.5 dark:border-zinc-800">
          <div className="inline-flex gap-0.5 rounded-[9px] bg-zinc-100 p-[3px] dark:bg-zinc-950">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setStatus(t.key)
                  setPage(1)
                }}
                className={`rounded-[7px] px-3 py-1.5 font-medium whitespace-nowrap transition-colors ${
                  status === t.key
                    ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-zinc-50'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                {t.label}
                <span className="ml-1.5 text-xs text-zinc-400 tabular-nums">{counts?.[t.count] ?? '·'}</span>
              </button>
            ))}
          </div>
          <label className="relative w-full sm:w-72">
            <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, company, phone…"
              aria-label="Search sponsor enquiries"
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
            {q ? 'No enquiries match your search.' : 'No sponsor enquiries yet. Enquiries from the website will appear here.'}
          </p>
        ) : (
          <>
            <div className={`overflow-x-auto transition-opacity ${loading ? 'opacity-50' : ''}`}>
              <table className="w-full min-w-[960px] border-collapse text-left">
                <thead>
                  <tr className="bg-zinc-50 text-xs font-semibold text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                    {['S.N.', 'Name', 'Contact', 'Submitted', 'Status'].map((h) => (
                      <th key={h} className={`border-b border-zinc-200 px-4 py-2.5 whitespace-nowrap dark:border-zinc-800 ${h === 'S.N.' ? 'w-14' : ''}`}>
                        {h}
                      </th>
                    ))}
                    <th className="border-b border-zinc-200 px-4 py-2.5 text-right dark:border-zinc-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r, i) => (
                    <Fragment key={r.id}>
                      <tr className="border-b border-zinc-200 align-middle transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50">
                        <td className="px-4 py-3 text-zinc-500 tabular-nums dark:text-zinc-400">{(data.page - 1) * data.per_page + i + 1}</td>
                        <td className="px-4 py-3">
                          <strong className="block font-semibold">{r.name}</strong>
                          <span className="block text-xs text-zinc-500 dark:text-zinc-400">{r.company ?? '—'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <a href={`tel:${r.contact}`} className="block hover:underline">
                            {r.contact}
                          </a>
                          {r.email && (
                            <a href={`mailto:${r.email}`} className="block text-xs text-zinc-500 hover:underline dark:text-zinc-400">
                              {r.email}
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">{fmtDate(r.created_at)}</td>
                        <td className="px-4 py-3">
                          <Badge status={r.status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            {busy === r.id && <Loader2 size={15} className="animate-spin text-zinc-400" />}
                            <button
                              className={`btn btn-xs ${r.notes ? 'border-zinc-400 dark:border-zinc-500' : ''}`}
                              onClick={() => setNotesOpen((o) => (o === r.id ? null : r.id))}
                              aria-expanded={notesOpen === r.id}
                              title={r.notes ?? 'Add notes'}
                            >
                              <NotebookPen size={14} /> Notes{r.notes ? ' •' : ''}
                            </button>
                            {r.status === 'new' ? (
                              <button
                                className="btn btn-xs border-green-200 text-green-700 hover:bg-green-50 dark:border-green-900 dark:text-green-400 dark:hover:bg-green-950/50"
                                disabled={busy === r.id}
                                onClick={() => setRowStatus(r, 'contacted')}
                              >
                                <Check size={14} /> Mark contacted
                              </button>
                            ) : (
                              <button
                                className="btn btn-xs border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-400 dark:hover:bg-amber-950/50"
                                disabled={busy === r.id}
                                onClick={() => setRowStatus(r, 'new')}
                              >
                                <Undo2 size={14} /> Mark new
                              </button>
                            )}
                            {canDelete && (
                              <button
                                className="btn btn-xs text-red-600 hover:border-red-200 hover:bg-red-50 dark:text-red-400 dark:hover:border-red-900 dark:hover:bg-red-950/50"
                                disabled={busy === r.id}
                                onClick={() => removeRow(r)}
                                title="Delete permanently"
                                aria-label={`Delete ${r.name}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {notesOpen === r.id && (
                        <tr className="border-b border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-950/40">
                          <td />
                          <td colSpan={5} className="px-4 py-3">
                            <Notes
                              key={`${r.id}-${r.notes ?? ''}`}
                              row={r}
                              onSave={(n) => run(r.id, () => api.updateSponsorInquiry(r.id, r.status, n), 'Notes saved.')}
                            />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <span className="text-zinc-500 dark:text-zinc-400">
                {data.total} enquir{data.total === 1 ? 'y' : 'ies'} · page {data.page} of {data.pages}
              </span>
              <span className="flex gap-1.5">
                <button className="btn" disabled={data.page <= 1} onClick={() => setPage(data.page - 1)} aria-label="Previous page">
                  <ChevronLeft size={16} />
                </button>
                <button className="btn" disabled={data.page >= data.pages} onClick={() => setPage(data.page + 1)} aria-label="Next page">
                  <ChevronRight size={16} />
                </button>
              </span>
            </div>
          </>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-lg bg-zinc-900 px-4 py-2.5 text-white shadow-lg dark:bg-zinc-50 dark:text-zinc-900">
          {toast}
        </div>
      )}
      {dialog}
    </>
  )
}

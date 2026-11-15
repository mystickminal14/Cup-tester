import { ArchiveRestore, ArrowLeft, Check, Loader2, Mail, MessageCircle, Phone, Trash2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { api, fmtDate, statusLabel, type Participant, type Status } from './api'
import { Avatar } from './Participants'
import { useConfirm } from './ConfirmDialog'
import { StatusBadge } from './StatusBadge'
import { linkClick, navigate } from './router'

/** WhatsApp wants digits only; assume Nepal (+977) for 10-digit mobiles. */
const waNumber = (phone: string) => {
  const d = phone.replace(/\D/g, '')
  return d.length === 10 ? `977${d}` : d
}

export function ParticipantDetail({ id, canDelete }: { id: number; canDelete: boolean }) {
  const [p, setP] = useState<Participant | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('interested')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [confirm, dialog] = useConfirm()

  const load = (row: Participant) => {
    setP(row)
    setStatus(row.status)
    setNotes(row.notes ?? '')
  }

  useEffect(() => {
    api
      .participant(id)
      .then((r) => load(r.participant))
      .catch((e: Error) => setError(e.message))
  }, [id])

  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (p && status !== p.status) {
      const ok = await confirm(
        status === 'registered'
          ? {
              title: `Mark ${p.full_name} as registered?`,
              message: 'Only do this once their payment is confirmed. Your notes will be saved too.',
              confirmLabel: 'Mark registered',
              tone: 'success',
            }
          : {
              title: `Move ${p.full_name} back to interested?`,
              message: 'Use this if their payment hasn’t arrived. Your notes will be saved too.',
              confirmLabel: 'Mark interested',
              tone: 'warning',
            },
      )
      if (!ok) return
    }
    setSaving(true)
    setError(null)
    try {
      const r = await api.updateParticipant(id, { status, notes })
      load(r.participant)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!p) return
    const ok = await confirm({
      title: `Delete ${p.full_name}?`,
      message: 'They’ll move to the Deleted tab, where you can restore them.',
      confirmLabel: 'Delete',
      tone: 'danger',
    })
    if (!ok) return
    try {
      await api.deleteParticipant(id)
      navigate('/admin')
    } catch (err) {
      setError((err as Error).message)
    }
  }
  const restore = async () => {
    if (!p) return
    const ok = await confirm({
      title: `Restore ${p.full_name}?`,
      message: 'They’ll be back in the participant lists.',
      confirmLabel: 'Restore',
      tone: 'neutral',
    })
    if (!ok) return
    try {
      load((await api.restoreParticipant(id)).participant)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const back = (
    <a href="/admin" onClick={linkClick} className="mb-3.5 inline-flex items-center gap-1.5 font-medium text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50">
      <ArrowLeft size={16} /> All participants
    </a>
  )

  if (!p)
    return (
      <>
        {back}
        <div className="grid place-items-center rounded-xl border border-zinc-200 bg-white py-16 dark:border-zinc-800 dark:bg-zinc-900">
          {error ? <p className="text-red-600 dark:text-red-400">{error}</p> : <Loader2 className="animate-spin text-zinc-400" />}
        </div>
      </>
    )

  const fields: [string, string | null][] = [
    ['Email', p.email],
    ['Phone', p.phone],
    ['City', p.city],
    ['Café / organization', p.organization],
    ['Role', p.role],
    ['Experience', p.experience],
    ['Social / portfolio', p.social],
    ['Heard about us', p.heard_from],
    ['Previous competitions', p.previous_competition],
    ['T-shirt size', p.tshirt_size],
    ['About them', p.bio],
    ['Press / promo consent', Number(p.press_consent) ? 'Yes' : 'No'],
    ['Payment screenshot sent', p.payment_confirmed_at ? `Yes, ${fmtDate(p.payment_confirmed_at)} (check WhatsApp)` : 'Not yet'],
    ['Submitted', fmtDate(p.created_at)],
  ]
  const dirty = status !== p.status || notes !== (p.notes ?? '')

  return (
    <>
      {back}
      {p.deleted_at && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
          <span>
            <strong>Deleted</strong> {fmtDate(p.deleted_at)}
            {p.deleted_by_name && <> by {p.deleted_by_name}</>}. Hidden from the lists.
          </span>
          {canDelete && (
            <button className="btn btn-xs" onClick={restore}>
              <ArchiveRestore size={14} /> Restore
            </button>
          )}
        </div>
      )}
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-4">
            {p.photo_url ? (
              <a href={p.photo_url} target="_blank" rel="noreferrer" title="Open full photo">
                <Avatar name={p.full_name} src={p.photo_url} size={72} />
              </a>
            ) : (
              <Avatar name={p.full_name} src={null} size={72} />
            )}
            <div className="min-w-0">
              <h2 className="mb-1.5 text-xl font-semibold tracking-tight">{p.full_name}</h2>
              <StatusBadge status={p.status} />
            </div>
          </div>

          <div className="my-5 flex flex-wrap gap-2">
            <a className="btn" href={`tel:${p.phone}`}>
              <Phone size={15} /> Call
            </a>
            <a className="btn" href={`https://wa.me/${waNumber(p.phone)}`} target="_blank" rel="noreferrer">
              <MessageCircle size={15} /> WhatsApp
            </a>
            <a className="btn" href={`mailto:${p.email}`}>
              <Mail size={15} /> Email
            </a>
            {canDelete && !p.deleted_at && (
              <button
                className="btn ml-auto text-red-600 hover:border-red-200 hover:bg-red-50 dark:text-red-400 dark:hover:border-red-900 dark:hover:bg-red-950/50"
                onClick={remove}
              >
                <Trash2 size={15} /> Delete
              </button>
            )}
          </div>

          <dl className="grid border-t border-zinc-200 sm:grid-cols-2 dark:border-zinc-800">
            {fields.map(([label, value]) => (
              <div key={label} className="border-b border-zinc-200 py-3 sm:odd:pr-4 dark:border-zinc-800">
                <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</dt>
                <dd className="mt-0.5 break-words whitespace-pre-line">{value || <span className="text-zinc-400">—</span>}</dd>
              </div>
            ))}
          </dl>
        </section>

        <form onSubmit={save} className="flex flex-col gap-3.5 rounded-xl border border-zinc-200 bg-white p-5 lg:sticky lg:top-[76px] dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <h3 className="text-[15px] font-semibold">Status</h3>
            <p className="mt-0.5 text-[12.5px] text-zinc-500 dark:text-zinc-400">
              Change to <strong className="text-zinc-700 dark:text-zinc-200">Registered</strong> once payment is confirmed.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Status">
            {(['interested', 'registered'] as Status[]).map((s) => (
              <label
                key={s}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 font-medium transition-shadow ${
                  status === s
                    ? 'border-zinc-900 shadow-[inset_0_0_0_1px_var(--color-zinc-900)] dark:border-zinc-50 dark:shadow-[inset_0_0_0_1px_var(--color-zinc-50)]'
                    : 'border-zinc-200 dark:border-zinc-700'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={s}
                  checked={status === s}
                  onChange={() => setStatus(s)}
                  className="accent-zinc-900 dark:accent-zinc-50"
                />
                {statusLabel[s]}
              </label>
            ))}
          </div>
          <label className="field">
            Notes
            <textarea
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Called on…, payment ref…"
              className="input resize-y"
            />
          </label>
          {error && <p className="text-[13px] font-medium text-red-600 dark:text-red-400">{error}</p>}
          <button type="submit" disabled={saving || !dirty} className="btn-primary w-full">
            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : null}
            {saved ? 'Saved' : 'Save'}
          </button>
          {p.status_changed_at && (
            <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400">
              Status last changed {fmtDate(p.status_changed_at)}
              {p.changed_by_name && <> by {p.changed_by_name}</>}.
            </p>
          )}
        </form>
      </div>
      {dialog}
    </>
  )
}

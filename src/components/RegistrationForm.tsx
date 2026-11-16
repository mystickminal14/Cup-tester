import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, ChevronDown, ImagePlus, Loader2, X } from 'lucide-react'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type ReactNode,
} from 'react'
import { contactUrl, event } from '../data/event'
import { emailReady, sendEmail } from '../lib/sendEmail'
import { EventDetails } from './EventDetails'
import { EASE, SectionLabel, SplitLines, SteamCup } from './ui'

/* ── Form model ───────────────────────────────────────────────────────────── */

type Values = {
  fullName: string
  email: string
  phone: string
  city: string
  organization: string
  role: string
  experience: string
  social: string
  previousCompetition: string
  heardFrom: string
  tshirtSize: string
  bio: string
  pressConsent: boolean
  confirm: boolean
}

type FieldName = keyof Values | 'photo'
type Errors = Partial<Record<FieldName, string>>

const initial: Values = {
  fullName: '',
  email: '',
  phone: '',
  city: '',
  organization: '',
  role: '',
  experience: '',
  social: '',
  previousCompetition: '',
  heardFrom: '',
  tshirtSize: '',
  bio: '',
  pressConsent: false,
  confirm: false,
}

const MAX_PHOTO_MB = 5


const experienceOptions = [
  'Less than 1 year',
  '1–3 years',
  '3–5 years',
  'More than 5 years',
  'Enthusiast / home brewer',
]

const tshirtOptions = ['Small', 'Medium', 'Large']

const heardOptions = [
  'Instagram',
  'Facebook',
  "The Barista's Coffee School",
  'A café or roastery',
  'Friend or colleague',
  'Previous Cup Tasters event',
  'Other',
]

const roleSuggestions = ['Barista', 'Roaster', 'Brewer', 'Café owner', 'Q Grader', 'Student', 'Coffee enthusiast']

/** The form is split into tabs; each step validates only its own fields. */
const steps: { title: string; short: string; fields: FieldName[] }[] = [
  { title: 'About you', short: 'You', fields: ['fullName', 'email', 'phone', 'city'] },
  { title: 'Coffee', short: 'Coffee', fields: ['organization', 'role', 'experience', 'social', 'tshirtSize', 'bio'] },
  { title: 'Championship', short: 'Compete', fields: ['previousCompetition', 'heardFrom', 'pressConsent', 'confirm'] },
  { title: 'Photo', short: 'Photo', fields: ['photo'] },
]
const stepOf = (f: FieldName) => steps.findIndex((st) => st.fields.includes(f))

function validate(v: Values, photo: File | null): Errors {
  const e: Errors = {}
  if (v.fullName.trim().length < 2) e.fullName = 'Please enter your full name.'
  if (!v.email.trim()) e.email = 'Please enter your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = 'That email address doesn’t look right.'
  const phone = v.phone.replace(/[\s()-]/g, '')
  if (!phone) e.phone = 'Please enter a phone number.'
  else if (!/^\+?\d{7,15}$/.test(phone)) e.phone = 'Digits only, e.g. 98XXXXXXXX or +977 98XXXXXXXX.'
  if (!v.city.trim()) e.city = 'Please enter your city.'
  if (!v.tshirtSize) e.tshirtSize = 'Please choose a T-shirt size.'
  if (v.bio.trim().length < 20) e.bio = 'Please tell us a little about yourself (at least a sentence or two).'
  if (photo) {
    if (!photo.type.startsWith('image/')) e.photo = 'Please choose a JPG, PNG or WebP image.'
    else if (photo.size > MAX_PHOTO_MB * 1024 * 1024) e.photo = `Image must be smaller than ${MAX_PHOTO_MB} MB.`
  }
  if (!v.confirm) e.confirm = 'Please confirm your information is accurate.'
  return e
}

/* ── Field primitives ─────────────────────────────────────────────────────── */

const controlCls =
  'block h-12 w-full min-w-0 rounded-xl border-2 bg-cream/60 px-4 text-[0.95rem] font-medium text-navy placeholder:text-navy/40 transition-[border-color,box-shadow,background-color] duration-200 focus:bg-white focus:outline-none focus:ring-4 focus:ring-yellow/70'

function Field({
  id,
  label,
  required,
  error,
  hint,
  children,
  className = '',
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <label
        htmlFor={id}
        className="mb-1.5 flex items-baseline justify-between gap-2 text-[0.7rem] font-bold tracking-[0.12em] text-navy/85 uppercase"
      >
        <span>
          {label}
          {required && (
            <span className="ml-0.5 text-red-deep" aria-hidden="true">
              *
            </span>
          )}
        </span>
        {!required && (
          <span className="text-[0.68rem] font-medium tracking-normal text-navy/55 normal-case">Optional</span>
        )}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[0.8rem] leading-snug font-semibold text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-navy/60">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="sr-only">{title}</legend>
      <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  )
}

/* ── Success state ────────────────────────────────────────────────────────── */

function Success({ name, preview, onReset }: { name: string; preview: boolean; onReset: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.focus()
  }, [])
  const cups = [
    [60, 20],
    [22, 86],
    [98, 86],
  ]
  return (
    <motion.div
      ref={ref}
      tabIndex={-1}
      className="waves relative overflow-hidden rounded-[2rem] bg-blue p-6 text-white outline-none sm:p-10"
      initial={{ opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' }}
      animate={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
      transition={{ duration: 0.9, ease: EASE }}
      role="status"
      aria-live="polite"
    >
      <div className="relative z-10">
        <svg viewBox="0 0 120 112" className="w-20 sm:w-28" aria-hidden="true">
          {cups.map(([cx, cy], i) => (
            <motion.circle
              key={i}
              cx={cx}
              cy={cy}
              r={18}
              fill={i === 2 ? 'var(--color-yellow)' : 'none'}
              stroke={i === 2 ? 'var(--color-yellow)' : 'var(--color-white)'}
              strokeWidth={1.5}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.4 + i * 0.15 }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />
          ))}
          <motion.path
            d="M89 86 l6 6 l12 -13"
            fill="none"
            stroke="var(--color-blue)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, ease: EASE, delay: 1.1 }}
          />
        </svg>

        <motion.h3
          className="title-section mt-8 text-yellow"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.6 }}
        >
          You&rsquo;re
          <br />
          registered!
        </motion.h3>
        <motion.p
          className="lead mt-5 max-w-xl text-white/85"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          Thank you for registering for the Cup Tasters Championship. We&rsquo;ll check your payment and the team
          will contact you with further information.
        </motion.p>
        <p className="eyebrow mt-6 break-words text-white/70">Competitor · {name}</p>
        {preview && (
          <p className="mt-5 rounded-xl bg-white/10 p-4 text-xs text-white/75">
            Preview mode: no form endpoint is configured yet, so this application was not sent. Set{' '}
            <code className="break-all text-yellow">registration.formEndpoint</code> in{' '}
            <code className="break-all text-yellow">src/data/event.ts</code>.
          </p>
        )}
        <button type="button" onClick={onReset} className="btn mt-8 bg-yellow text-navy hover:bg-white">
          Register someone else <ArrowRight size={12} />
        </button>
      </div>
    </motion.div>
  )
}

/* ── Pay screen (after the form is submitted) ─────────────────────────────── */

const PENDING_KEY = 'ct-pending-payment'
type Pending = { id: number; token: string; name: string }

function readPending(): Pending | null {
  try {
    const v = JSON.parse(localStorage.getItem(PENDING_KEY) ?? 'null')
    return v && typeof v.id === 'number' && typeof v.token === 'string' ? v : null
  } catch {
    return null
  }
}
function writePending(v: Pending | null) {
  try {
    if (v) localStorage.setItem(PENDING_KEY, JSON.stringify(v))
    else localStorage.removeItem(PENDING_KEY)
  } catch {
    /* storage unavailable: the pay screen just won't survive a reload */
  }
}

const confirmEndpoint = event.registration.formEndpoint?.replace(/register\.php$/, 'confirm-payment.php') ?? null

function PayScreen({ pending, onDone }: { pending: Pending; onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'idle' | 'sending' | 'error'>('idle')
  useEffect(() => {
    ref.current?.focus()
  }, [])

  const confirm = async () => {
    setState('sending')
    try {
      if (confirmEndpoint && pending.id > 0) {
        const res = await fetch(confirmEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ id: pending.id, token: pending.token }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
      }
      onDone()
    } catch {
      setState('error')
    }
  }

  return (
    <motion.div
      ref={ref}
      tabIndex={-1}
      className="sticker relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-white outline-none"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <div className="bg-blue px-5 py-6 text-white sm:px-8 sm:py-7">
        <p className="eyebrow text-yellow">Last step · Payment</p>
        <p className="headline mt-2 text-[clamp(1.5rem,2.8vw,2.1rem)]">Pay to complete your registration</p>
        <p className="mt-1 text-sm font-medium text-white/80">Hi {pending.name}, your details are saved. Pay the fee and send us the screenshot.</p>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-8">
        <PaymentInfo />
        <div className="mt-auto pt-6">
          {state === 'error' && (
            <p role="alert" className="mb-4 rounded-xl bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
              Something went wrong. Please try again, or call {event.payment.phone}.
            </p>
          )}
          <button
            type="button"
            onClick={confirm}
            disabled={state === 'sending'}
            className="btn group w-full justify-center bg-blue py-4 text-yellow shadow-[0_6px_0_-1px_var(--color-yellow)] hover:bg-red-deep hover:text-white disabled:opacity-70 sm:w-auto"
          >
            {state === 'sending' ? 'Registering…' : 'I’ve sent the payment screenshot'}
            {state === 'sending' ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} strokeWidth={3} />}
          </button>
          <p className="mt-3 text-xs font-medium text-navy/60">
            Tap this only after sending the screenshot on WhatsApp to {event.payment.phone}.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Payment info ─────────────────────────────────────────────────────────── */

function PaymentInfo() {
  const { phone, whatsappUrl, qrImage } = event.payment
  const [qrMissing, setQrMissing] = useState(false)
  return (
    <div className="grid gap-5 rounded-2xl border-2 border-dashed border-blue/25 bg-cream/70 p-4 text-sm leading-relaxed text-navy sm:grid-cols-[auto_1fr] sm:p-5">
      <div className="flex justify-center">
        {qrMissing ? (
          <div className="flex h-48 w-48 items-center justify-center rounded-xl bg-white p-4 text-center text-xs font-semibold text-navy/55 ring-2 ring-blue/15">
            Payment QR code coming soon
          </div>
        ) : (
          <a href={qrImage} target="_blank" rel="noreferrer" className="block self-start rounded-xl bg-white p-2 ring-2 ring-blue/15" title="Open QR code full size">
            <img src={qrImage} alt="Payment QR code (Global IME Bank)" className="h-auto w-56 sm:w-52" onError={() => setQrMissing(true)} />
          </a>
        )}
      </div>
      <div>
        <p className="eyebrow text-blue">Registration fee</p>
        <p className="headline mt-1 text-[1.35rem] text-blue">{event.fee}</p>
        <ol className="mt-3 list-decimal space-y-1 pl-5 font-medium">
          <li>Scan the QR code and pay the registration fee.</li>
          <li>Download the payment statement (PDF) or take a screenshot.</li>
          <li>
            Send it on WhatsApp to{' '}
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="font-bold underline decoration-red decoration-2 underline-offset-4">
              {phone}
            </a>
            .
          </li>
          <li>Tap &ldquo;I&rsquo;ve sent the payment screenshot&rdquo; below.</li>
        </ol>
        <p className="mt-3 text-navy/75">
          If you have any issues with payment, please contact us. For more information contact{' '}
          <a href={`tel:+977${phone}`} className="font-bold whitespace-nowrap">
            {phone}
          </a>
          .
        </p>
      </div>
    </div>
  )
}

/* ── Main component ───────────────────────────────────────────────────────── */

export function RegistrationForm() {
  const uid = useId()
  const id = (n: string) => `${uid}-${n}`
  const formRef = useRef<HTMLFormElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [values, setValues] = useState<Values>(initial)
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({})
  const [step, setStep] = useState(0)
  const [reached, setReached] = useState(0)
  const [attempted, setAttempted] = useState<boolean[]>(() => steps.map(() => false))
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [pending, setPending] = useState<Pending | null>(readPending)
  const [registeredName, setRegisteredName] = useState('')
  const [dragging, setDragging] = useState(false)

  const errors = validate(values, photo)
  const show = (f: FieldName) => (touched[f] || attempted[stepOf(f)] ? errors[f] : undefined)
  const stepErrors = (i: number) => steps[i].fields.filter((f) => errors[f])

  const focusField = (f: FieldName) =>
    requestAnimationFrame(() => {
      const el = formRef.current?.querySelector<HTMLElement>(`[name="${f}"]`)
      el?.focus({ preventScroll: true })
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })

  const goTo = (i: number) => {
    setStep(i)
    setReached((r) => Math.max(r, i))
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const next = () => {
    const bad = stepErrors(step)
    if (bad.length) {
      setAttempted((a) => a.map((v, i) => (i === step ? true : v)))
      focusField(bad[0])
      return
    }
    goTo(step + 1)
  }

  // Release the preview URL when it changes or the form unmounts.
  useEffect(() => () => void (photoUrl && URL.revokeObjectURL(photoUrl)), [photoUrl])

  const set = (k: keyof Values) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const val = e.target instanceof HTMLInputElement && e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setValues((v) => ({ ...v, [k]: val }))
  }
  const blur = (k: FieldName) => () => setTouched((t) => ({ ...t, [k]: true }))

  const a11y = (k: FieldName, hint = false) => ({
    id: id(k),
    name: k,
    onBlur: blur(k),
    'aria-invalid': !!show(k) || undefined,
    'aria-describedby': show(k) ? `${id(k)}-error` : hint ? `${id(k)}-hint` : undefined,
  })
  const border = (k: FieldName) =>
    show(k) ? 'border-danger focus:border-danger' : 'border-blue/15 hover:border-blue/35 focus:border-blue'

  const pickPhoto = (file: File | undefined | null) => {
    setPhoto(file ?? null)
    setPhotoUrl(file ? URL.createObjectURL(file) : null)
    setTouched((t) => ({ ...t, photo: true }))
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    pickPhoto(e.dataTransfer.files?.[0])
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (step < steps.length - 1) return next()
    setAttempted(steps.map(() => true))
    const badStep = steps.findIndex((_, i) => stepErrors(i).length > 0)
    if (badStep !== -1) {
      setStep(badStep)
      focusField(stepErrors(badStep)[0])
      return
    }
    // Honeypot: bots fill hidden fields.
    if ((formRef.current?.elements.namedItem('bcs_hp_x9') as HTMLInputElement | null)?.value) return

    setStatus('sending')
    try {
      const endpoint = event.registration.formEndpoint

      // Upload the photo first so the email can link to it. If the upload
      // fails, the application is still sent, just without the photo link.
      let uploadedPhotoUrl = ''
      if (photo && event.registration.cloudinary.cloudName) {
        try {
          const up = new FormData()
          up.append('file', photo)
          up.append('upload_preset', event.registration.cloudinary.uploadPreset)
          up.append('folder', 'cup-tasters')
          const r = await fetch(`https://api.cloudinary.com/v1_1/${event.registration.cloudinary.cloudName}/image/upload`, { method: 'POST', body: up })
          if (r.ok) uploadedPhotoUrl = ((await r.json()) as { secure_url: string }).secure_url
        } catch {
          // network error: carry on without the photo link
        }
      }

      if (emailReady) {
        const yes = (b: boolean) => (b ? 'Yes' : 'No')
        await sendEmail({
          subject: `New Cup Tasters registration: ${values.fullName.trim()} (${values.city.trim()})`,
          heading: 'New competitor registration',
          replyTo: values.email.trim(),
          sections: [
            {
              title: '01 · About you',
              rows: [
                ['Full name', values.fullName.trim()],
                ['Email', values.email.trim()],
                ['Phone', values.phone.trim()],
                ['City', values.city.trim()],
              ],
            },
            {
              title: '02 · Coffee background',
              rows: [
                ['Coffee shop / organization', values.organization.trim()],
                ['Role / position', values.role.trim()],
                ['Coffee experience', values.experience],
                ['Instagram / social', values.social.trim()],
                ['T-shirt size', values.tshirtSize],
                ['Bio', values.bio.trim()],
              ],
            },
            {
              title: '03 · Championship',
              rows: [
                ['Previous competitions', values.previousCompetition.trim()],
                ['Heard about it from', values.heardFrom],
                ['Press / photo consent', yes(values.pressConsent)],
                ['Profile photo', uploadedPhotoUrl ? 'Uploaded (below)' : photo ? 'Upload failed: ask the applicant to email it' : 'Not provided'],
              ],
            },
          ],
          photoUrl: uploadedPhotoUrl || undefined,
          footer: 'Applicant confirmed the information is accurate',
        })
      }

      // Admin panel / backend submission (runs alongside the email when formEndpoint is set).
      if (endpoint) {
        const data = new FormData()
        Object.entries(values).forEach(([k, v]) => data.append(k, String(v)))
        if (photo) data.append('photo', photo)
        if (uploadedPhotoUrl) data.append('photoUrl', uploadedPhotoUrl)
        data.append('submittedAt', new Date().toISOString())
        const res = await fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const out = (await res.json().catch(() => ({}))) as { id?: number; token?: string }
        const p = { id: out.id ?? 0, token: out.token ?? '', name: values.fullName.trim() }
        writePending(p)
        setPending(p)
      } else {
        if (!emailReady) await new Promise((r) => setTimeout(r, 900))
        setPending({ id: 0, token: '', name: values.fullName.trim() })
      }
      setStatus('idle')
      document.getElementById('register')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch {
      setStatus('error')
    }
  }

  const paid = () => {
    setRegisteredName(pending?.name ?? values.fullName.trim())
    writePending(null)
    setPending(null)
    setStatus('done')
    document.getElementById('register')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const reset = () => {
    setValues(initial)
    setPhoto(null)
    setPhotoUrl(null)
    setTouched({})
    setStep(0)
    setReached(0)
    setAttempted(steps.map(() => false))
    setStatus('idle')
  }

  const closed = event.registration.status === 'closed' || !event.registration.acceptingApplications
  const errorCount = stepErrors(step).length
  const last = step === steps.length - 1

  const select = (k: 'experience' | 'heardFrom' | 'tshirtSize', options: string[]) => (
    <div className="relative">
      <select
        {...a11y(k)}
        value={values[k]}
        onChange={set(k)}
        className={`${controlCls} ${border(k)} cursor-pointer appearance-none pr-10 ${values[k] ? '' : 'text-navy/45'}`}
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o} className="text-navy">
            {o}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-blue" />
    </div>
  )

  const checkbox = (k: 'confirm' | 'pressConsent', text: string, required = false) => (
    <div className="sm:col-span-2">
      <label htmlFor={id(k)} className="flex cursor-pointer items-start gap-3">
        <input {...a11y(k)} type="checkbox" checked={values[k]} onChange={set(k)} className="peer sr-only" />
        <span
          className={`mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-yellow/70 ${
            values[k] ? 'border-blue bg-blue text-yellow' : show(k) ? 'border-danger bg-white' : 'border-blue/40 bg-white'
          }`}
          aria-hidden="true"
        >
          {values[k] && <Check size={13} strokeWidth={3} />}
        </span>
        <span className="text-sm leading-snug font-semibold">
          {text}
          {required && (
            <span className="text-red-deep" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </span>
      </label>
      {show(k) && (
        <p id={`${id(k)}-error`} className="mt-1.5 ml-9 text-[0.8rem] font-semibold text-danger">
          {errors[k]}
        </p>
      )}
    </div>
  )

  return (
    <section id="register" className="relative bg-cream">
      <div className="wrap section-y grid gap-8 lg:grid-cols-12 lg:items-stretch lg:gap-10">
        {/* Left: invitation + key facts */}
        <div className="min-w-0 lg:col-span-5">
          <div className="waves sticker relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-blue p-6 text-white sm:p-8">
            <SteamCup className="absolute top-6 right-6 h-14 w-14 text-white" />
            <SectionLabel index="05" className="text-yellow">
              Register
            </SectionLabel>
            <SplitLines
              className="headline headline-shadow mt-6 text-[clamp(2.6rem,min(5.5vw,9svh),4.5rem)]"
              lines={[
                'Enter',
                <span key="c" className="text-yellow">
                  the cup.
                </span>,
              ]}
            />
            <p className="title-sub mt-4 text-white/90">Think you can find the difference?</p>
            <div className="mt-6">
              <EventDetails />
            </div>
            <a
              href={contactUrl}
              target="_blank"
              rel="noreferrer"
              className="group mt-auto flex items-center justify-between gap-3 pt-6 text-sm font-semibold text-white/85 hover:text-yellow"
            >
              Questions about entering? Contact the organizers
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>

        {/* Right: form / success */}
        <div className="min-w-0 lg:col-span-7">
          <AnimatePresence mode="wait">
            {status === 'done' ? (
              <Success
                key="ok"
                name={registeredName}
                preview={!emailReady && !event.registration.formEndpoint}
                onReset={reset}
              />
            ) : pending ? (
              <PayScreen key="pay" pending={pending} onDone={paid} />
            ) : closed ? (
              <motion.div
                key="closed"
                className="rounded-[2rem] bg-white p-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="title-section text-blue">Registration closed</p>
                <p className="mt-3 text-navy/75">Follow The Barista&rsquo;s Coffee School for the next edition.</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                ref={formRef}
                noValidate
                onSubmit={onSubmit}
                aria-label="Cup Tasters Championship application"
                className="sticker relative flex h-full scroll-mt-24 flex-col overflow-hidden rounded-[2rem] bg-white"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                {/* honeypot */}
                <div className="absolute -left-[9999px]" aria-hidden="true">
                  <label>
                    {/* Non-semantic name/label so browser autofill never fills it (it used to be "website"). */}
                    Leave this empty <input type="text" name="bcs_hp_x9" tabIndex={-1} autoComplete="new-password" defaultValue="" />
                  </label>
                </div>

                {/* Step tabs */}
                <div className="bg-blue px-4 pt-5 pb-0 text-white sm:px-8 sm:pt-7">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="headline text-[clamp(1.4rem,2.6vw,1.9rem)]">Application form</p>
                    <p className="eyebrow text-yellow tabular-nums">
                      Step {step + 1} / {steps.length}
                    </p>
                  </div>
                  <div role="tablist" aria-label="Application steps" className="mt-5 grid grid-cols-4 gap-1">
                    {steps.map((st, i) => {
                      const on = i === step
                      const done = i < reached && stepErrors(i).length === 0
                      return (
                        <button
                          key={st.title}
                          type="button"
                          role="tab"
                          aria-selected={on}
                          disabled={i > reached}
                          onClick={() => goTo(i)}
                          title={st.title}
                          className={`relative flex min-w-0 items-center justify-center gap-1.5 rounded-t-2xl px-1.5 py-3 text-[0.85rem] font-bold transition-colors sm:px-2.5 ${
                            on
                              ? 'bg-white text-blue'
                              : 'text-white/75 hover:bg-white/10 hover:text-white disabled:opacity-45 disabled:hover:bg-transparent'
                          }`}
                        >
                          <span
                            className={`headline flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.85rem] ${
                              on ? 'bg-yellow text-navy' : done ? 'bg-yellow text-navy' : 'bg-white/15'
                            }`}
                          >
                            {done && !on ? <Check size={14} strokeWidth={3} /> : i + 1}
                          </span>
                          <span className="hidden min-w-0 truncate sm:inline">{st.short}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5 sm:p-8">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={step}
                      className="pb-8"
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      transition={{ duration: 0.35, ease: EASE }}
                    >
                      {step === 0 && (
                        <Step title={steps[0].title}>
                          <Field id={id('fullName')} label="Full name" required error={show('fullName')}>
                            <input
                              {...a11y('fullName')}
                              type="text"
                              autoComplete="name"
                              value={values.fullName}
                              onChange={set('fullName')}
                              className={`${controlCls} ${border('fullName')}`}
                            />
                          </Field>
                          <Field id={id('email')} label="Email" required error={show('email')}>
                            <input
                              {...a11y('email')}
                              type="email"
                              inputMode="email"
                              autoComplete="email"
                              value={values.email}
                              onChange={set('email')}
                              className={`${controlCls} ${border('email')}`}
                            />
                          </Field>
                          <Field id={id('phone')} label="Phone number" required error={show('phone')}>
                            <input
                              {...a11y('phone')}
                              type="tel"
                              inputMode="tel"
                              autoComplete="tel"
                              value={values.phone}
                              onChange={set('phone')}
                              placeholder="+977 98XXXXXXXX"
                              className={`${controlCls} ${border('phone')}`}
                            />
                          </Field>
                          <Field id={id('city')} label="City" required error={show('city')}>
                            <input
                              {...a11y('city')}
                              type="text"
                              autoComplete="address-level2"
                              value={values.city}
                              onChange={set('city')}
                              className={`${controlCls} ${border('city')}`}
                            />
                          </Field>
                        </Step>
                      )}
                      {step === 1 && (
                        <Step title={steps[1].title}>
                          <Field id={id('organization')} label="Coffee shop / organization">
                            <input
                              {...a11y('organization')}
                              type="text"
                              autoComplete="organization"
                              value={values.organization}
                              onChange={set('organization')}
                              className={`${controlCls} ${border('organization')}`}
                            />
                          </Field>
                          <Field id={id('role')} label="Role / position">
                            <input
                              {...a11y('role')}
                              type="text"
                              list={id('roles')}
                              autoComplete="organization-title"
                              value={values.role}
                              onChange={set('role')}
                              placeholder="e.g. Barista"
                              className={`${controlCls} ${border('role')}`}
                            />
                            <datalist id={id('roles')}>
                              {roleSuggestions.map((r) => (
                                <option key={r} value={r} />
                              ))}
                            </datalist>
                          </Field>
                          <Field id={id('experience')} label="Coffee experience">
                            {select('experience', experienceOptions)}
                          </Field>
                          <Field id={id('social')} label="Instagram / social">
                            <input
                              {...a11y('social')}
                              type="text"
                              autoCapitalize="none"
                              value={values.social}
                              onChange={set('social')}
                              placeholder="@handle"
                              className={`${controlCls} ${border('social')}`}
                            />
                          </Field>
                          <Field id={id('tshirtSize')} label="T-shirt size" required error={show('tshirtSize')}>
                            {select('tshirtSize', tshirtOptions)}
                          </Field>
                          <Field
                            id={id('bio')}
                            label="Please tell us a little about yourself"
                            required
                            error={show('bio')}
                            hint="For example: Where do you work? How long have you been competing? What made you want to compete? Any fun facts about yourself? How did you get into the coffee industry?"
                            className="sm:col-span-2"
                          >
                            <p className="mb-2 text-xs leading-relaxed text-navy/65">
                              This information may be used for official programs, emcee cards, and on the web and in
                              social media.
                            </p>
                            <textarea
                              {...a11y('bio', true)}
                              rows={4}
                              value={values.bio}
                              onChange={set('bio')}
                              placeholder="Where do you work? How long have you been competing? What made you want to compete?"
                              className={`${controlCls} ${border('bio')} h-auto min-h-[7rem] resize-y py-3`}
                            />
                          </Field>
                        </Step>
                      )}
                      {step === 2 && (
                        <Step title={steps[2].title}>
                          <Field
                            id={id('previousCompetition')}
                            label="Previous competition experience"
                            hint="Competitions entered and rounds reached, or “none yet”."
                            className="sm:col-span-2"
                          >
                            <textarea
                              {...a11y('previousCompetition', true)}
                              rows={2}
                              value={values.previousCompetition}
                              onChange={set('previousCompetition')}
                              className={`${controlCls} ${border('previousCompetition')} h-auto min-h-[4.75rem] resize-y py-3`}
                            />
                          </Field>
                          <Field id={id('heardFrom')} label="How did you hear about it?">
                            {select('heardFrom', heardOptions)}
                          </Field>
                          {checkbox(
                            'pressConsent',
                            'I consent to have my contact information shared for press inquiries and select event-related promotions from Cup Tasters Organizers.',
                          )}
                          {checkbox('confirm', 'I confirm that the information provided is accurate.', true)}
                        </Step>
                      )}
                      {step === 3 && (
                        <Step title={steps[3].title}>
                          <Field
                            id={id('photo')}
                            label="Photo to be displayed on social media"
                            error={show('photo')}
                            hint="This photo will be displayed on social media and used throughout the event: on your competitor card, scoreboards and official announcements. Please use a clear, front-facing photo."
                            className="sm:col-span-2"
                          >
                            <div
                              onDragOver={(e) => {
                                e.preventDefault()
                                setDragging(true)
                              }}
                              onDragLeave={() => setDragging(false)}
                              onDrop={onDrop}
                              className={`flex min-w-0 flex-col items-center gap-4 rounded-2xl border-2 border-dashed bg-cream/60 p-5 text-center transition-colors focus-within:ring-4 focus-within:ring-yellow/70 sm:flex-row sm:text-left ${
                                dragging ? 'border-red bg-red/5' : show('photo') ? 'border-danger' : 'border-blue/30'
                              }`}
                            >
                              <span className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-yellow">
                                {photoUrl ? (
                                  <img src={photoUrl} alt="Selected photo" className="h-full w-full object-cover" />
                                ) : (
                                  <ImagePlus size={36} strokeWidth={1.75} className="text-navy" />
                                )}
                              </span>
                              <div className="min-w-0 flex-1">
                                {photo ? (
                                  <>
                                    <p className="truncate text-sm font-bold">{photo.name}</p>
                                    <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                                      <label htmlFor={id('photo')} className="btn cursor-pointer border-blue/25 px-4 py-2 text-blue hover:border-blue">
                                        Change photo
                                      </label>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          pickPhoto(null)
                                          if (fileRef.current) fileRef.current.value = ''
                                        }}
                                        className="btn border-blue/25 px-4 py-2 text-navy/70 hover:border-danger hover:text-danger"
                                      >
                                        <X size={14} /> Remove
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <label htmlFor={id('photo')} className="cursor-pointer text-sm">
                                      <span className="font-bold underline decoration-red decoration-2 underline-offset-4">
                                        Choose image
                                      </span>{' '}
                                      or drag it here
                                    </label>
                                    <p className="mt-1 text-xs text-navy/60">JPG, PNG or WebP · max {MAX_PHOTO_MB} MB</p>
                                  </>
                                )}
                              </div>
                              <input
                                ref={fileRef}
                                {...a11y('photo', true)}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => pickPhoto(e.target.files?.[0])}
                                className="sr-only"
                              />
                            </div>
                          </Field>
                        </Step>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <div className="mt-auto border-t-2 border-dashed border-blue/15 pt-6">
                    {status === 'error' && (
                      <p
                        role="alert"
                        className="mb-5 rounded-xl bg-danger/10 px-4 py-3 text-sm font-semibold text-danger"
                      >
                        Something went wrong sending your application. Please try again in a moment.
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-3">
                      {step > 0 ? (
                        <button
                          type="button"
                          onClick={() => goTo(step - 1)}
                          className="btn group border-blue/25 px-5 text-blue hover:border-blue"
                        >
                          <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span> Back
                        </button>
                      ) : (
                        <span />
                      )}
                      {/* Distinct keys: without them React reuses one <button> and flips it to
                          type="submit" mid-click, so "Next: Photo" submitted the form. */}
                      {last ? (
                        <button
                          key="submit"
                          type="submit"
                          disabled={status === 'sending'}
                          className="btn group shrink-0 bg-blue py-4 whitespace-nowrap text-yellow shadow-[0_6px_0_-1px_var(--color-yellow)] hover:bg-red-deep hover:text-white disabled:opacity-70"
                        >
                          {status === 'sending' ? 'Submitting…' : 'Submit & pay'}
                          {status === 'sending' ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                          )}
                        </button>
                      ) : (
                        <button
                          key="next"
                          type="button"
                          onClick={next}
                          className="btn group shrink-0 bg-blue text-white hover:bg-red-deep"
                        >
                          Next: {steps[step + 1].short}
                          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                        </button>
                      )}
                    </div>
                    <p className="mt-4 text-xs font-medium text-navy/60" aria-live="polite">
                      {attempted[step] && errorCount > 0 ? (
                        `Please check the ${errorCount === 1 ? 'highlighted field' : `${errorCount} highlighted fields`}.`
                      ) : (
                        <>
                          Fields marked <span className="text-red-deep">*</span> are required. After submitting, you&rsquo;ll
                          see the payment QR code.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

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
import { event } from '../data/event'
import { Eligibility } from './Eligibility'
import { EventDetails } from './EventDetails'
import { EASE, SectionLabel, SplitLines } from './ui'

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

function validate(v: Values, photo: File | null): Errors {
  const e: Errors = {}
  if (v.fullName.trim().length < 2) e.fullName = 'Please enter your full name.'
  if (!v.email.trim()) e.email = 'Please enter your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = 'That email address doesn’t look right.'
  const phone = v.phone.replace(/[\s()-]/g, '')
  if (!phone) e.phone = 'Please enter a phone number.'
  else if (!/^\+?\d{7,15}$/.test(phone)) e.phone = 'Digits only, e.g. 98XXXXXXXX or +977 98XXXXXXXX.'
  if (!v.city.trim()) e.city = 'Please enter your city.'
  if (photo) {
    if (!photo.type.startsWith('image/')) e.photo = 'Please choose a JPG, PNG or WebP image.'
    else if (photo.size > MAX_PHOTO_MB * 1024 * 1024) e.photo = `Image must be smaller than ${MAX_PHOTO_MB} MB.`
  }
  if (!v.confirm) e.confirm = 'Please confirm your information is accurate.'
  return e
}

/* ── Field primitives ─────────────────────────────────────────────────────── */

const controlCls =
  'block h-12 w-full min-w-0 rounded-[3px] border bg-white/70 px-3.5 text-[0.95rem] text-ink placeholder:text-ink/40 transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-[3px] focus:ring-accent/25'

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
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between gap-2 text-[0.7rem] font-semibold tracking-[0.12em] text-ink/80 uppercase">
        <span>
          {label}
          {required && (
            <span className="ml-0.5 text-accent-deep" aria-hidden="true">
              *
            </span>
          )}
        </span>
        {!required && <span className="text-[0.68rem] font-normal tracking-normal text-ink/50 normal-case">Optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[0.8rem] leading-snug font-medium text-accent-deep">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink/55">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

function Group({ index, title, children, first }: { index: string; title: string; children: ReactNode; first?: boolean }) {
  return (
    <fieldset className={first ? '' : 'mt-7 border-t border-ink/10 pt-7'}>
      <legend className="float-left mb-4 flex w-full items-center gap-2.5 text-[0.72rem] font-bold tracking-[0.18em] uppercase">
        <span className="text-accent-deep tabular-nums">{index}</span>
        {title}
      </legend>
      <div className="clear-both grid gap-x-5 gap-y-4 sm:grid-cols-2">{children}</div>
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
      className="grain relative overflow-hidden rounded-[4px] bg-espresso p-6 text-cream outline-none sm:p-10"
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
              fill={i === 2 ? 'var(--color-accent)' : 'none'}
              stroke={i === 2 ? 'var(--color-accent)' : 'var(--color-cream)'}
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
            stroke="var(--color-cream)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, ease: EASE, delay: 1.1 }}
          />
        </svg>

        <motion.h3
          className="title-section mt-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.6 }}
        >
          Application
          <br />
          received
        </motion.h3>
        <motion.p
          className="lead mt-5 max-w-xl text-cream/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          Thank you for registering for the Cup Tasters Championship. The Barista&rsquo;s Coffee School team
          will contact you with further information.
        </motion.p>
        <p className="eyebrow mt-6 break-words text-cream/55">Applicant · {name}</p>
        {preview && (
          <p className="mt-5 border-l-2 border-accent pl-4 text-xs text-cream/60">
            Preview mode — no form endpoint is configured yet, so this application was not sent. Set{' '}
            <code className="break-all text-cream/85">registration.formEndpoint</code> in{' '}
            <code className="break-all text-cream/85">src/data/event.ts</code>.
          </p>
        )}
        <button
          type="button"
          onClick={onReset}
          className="eyebrow mt-8 inline-flex items-center gap-2 border-b border-cream/30 pb-1 hover:border-accent"
        >
          Submit another application <ArrowRight size={12} />
        </button>
      </div>
    </motion.div>
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
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [dragging, setDragging] = useState(false)

  const errors = validate(values, photo)
  const show = (f: FieldName) => (touched[f] || submitted ? errors[f] : undefined)

  // Release the preview URL when it changes or the form unmounts.
  useEffect(() => () => void (photoUrl && URL.revokeObjectURL(photoUrl)), [photoUrl])

  const set =
    (k: keyof Values) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    show(k) ? 'border-accent-deep focus:border-accent-deep' : 'border-ink/20 hover:border-ink/40 focus:border-espresso'

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
    setSubmitted(true)
    const errs = validate(values, photo)
    const first = (Object.keys(errs) as FieldName[])[0]
    if (first) {
      const el = formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)
      el?.focus({ preventScroll: true })
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    // Honeypot: bots fill hidden fields.
    if ((formRef.current?.elements.namedItem('website') as HTMLInputElement | null)?.value) return

    setStatus('sending')
    try {
      const endpoint = event.registration.formEndpoint
      if (endpoint) {
        const data = new FormData()
        Object.entries(values).forEach(([k, v]) => data.append(k, String(v)))
        if (photo) data.append('photo', photo)
        data.append('submittedAt', new Date().toISOString())
        const res = await fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
      } else {
        await new Promise((r) => setTimeout(r, 900))
      }
      setStatus('done')
      document.getElementById('register')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch {
      setStatus('error')
    }
  }

  const reset = () => {
    setValues(initial)
    setPhoto(null)
    setPhotoUrl(null)
    setTouched({})
    setSubmitted(false)
    setStatus('idle')
  }

  const closed = event.registration.status === 'closed' || !event.registration.acceptingApplications
  const errorCount = Object.keys(errors).length

  const select = (k: 'experience' | 'heardFrom', options: string[]) => (
    <div className="relative">
      <select
        {...a11y(k)}
        value={values[k]}
        onChange={set(k)}
        className={`${controlCls} ${border(k)} cursor-pointer appearance-none pr-10 ${values[k] ? '' : 'text-ink/45'}`}
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o} className="text-ink">
            {o}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-ink/50" />
    </div>
  )

  return (
    <section id="register" className="relative bg-cream">
      <div className="wrap section-y grid gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Left: invitation + key facts */}
        <div className="min-w-0 lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <SectionLabel index="04">Register</SectionLabel>
            <SplitLines
              className="display mt-5 text-[clamp(2.4rem,5.5vw,4.75rem)]"
              lines={['Enter', <span key="c" className="text-accent">the cup.</span>]}
            />
            <p className="title-sub mt-4 normal-case tracking-[-0.01em]">Think you can find the difference?</p>
            <div className="mt-7 space-y-7">
              <EventDetails />
              <Eligibility />
            </div>
          </div>
        </div>

        {/* Right: form / success */}
        <div className="min-w-0 lg:col-span-8">
          <AnimatePresence mode="wait">
            {status === 'done' ? (
              <Success key="ok" name={values.fullName.trim()} preview={!event.registration.formEndpoint} onReset={reset} />
            ) : closed ? (
              <motion.div key="closed" className="rounded-[4px] border border-ink/15 p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="title-section">Registration closed</p>
                <p className="mt-3 text-ink/70">Follow The Barista&rsquo;s Coffee School for the next edition.</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                ref={formRef}
                noValidate
                onSubmit={onSubmit}
                aria-label="Cup Tasters Championship application"
                className="relative rounded-[4px] border border-ink/12 bg-[#f9f5ee] p-5 shadow-[0_1px_0_rgb(23_19_18/0.04),0_24px_48px_-32px_rgb(36_26_23/0.35)] sm:p-8 lg:p-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                {/* triangle motif on the form's corner */}
                <svg className="absolute top-5 right-5 hidden w-6 text-ink/25 sm:block" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="5" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
                  <circle cx="5" cy="18" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
                  <circle cx="19" cy="18" r="3.6" fill="var(--color-accent)" />
                </svg>

                {/* honeypot */}
                <div className="absolute -left-[9999px]" aria-hidden="true">
                  <label>
                    Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>

                <Group index="01" title="Personal information" first>
                  <Field id={id('fullName')} label="Full name" required error={show('fullName')}>
                    <input {...a11y('fullName')} type="text" autoComplete="name" value={values.fullName} onChange={set('fullName')} className={`${controlCls} ${border('fullName')}`} />
                  </Field>
                  <Field id={id('email')} label="Email" required error={show('email')}>
                    <input {...a11y('email')} type="email" inputMode="email" autoComplete="email" value={values.email} onChange={set('email')} className={`${controlCls} ${border('email')}`} />
                  </Field>
                  <Field id={id('phone')} label="Phone number" required error={show('phone')}>
                    <input {...a11y('phone')} type="tel" inputMode="tel" autoComplete="tel" value={values.phone} onChange={set('phone')} placeholder="+977 98XXXXXXXX" className={`${controlCls} ${border('phone')}`} />
                  </Field>
                  <Field id={id('city')} label="City" required error={show('city')}>
                    <input {...a11y('city')} type="text" autoComplete="address-level2" value={values.city} onChange={set('city')} className={`${controlCls} ${border('city')}`} />
                  </Field>
                </Group>

                <Group index="02" title="Coffee background">
                  <Field id={id('organization')} label="Coffee shop / organization">
                    <input {...a11y('organization')} type="text" autoComplete="organization" value={values.organization} onChange={set('organization')} className={`${controlCls} ${border('organization')}`} />
                  </Field>
                  <Field id={id('role')} label="Role / position">
                    <input {...a11y('role')} type="text" list={id('roles')} autoComplete="organization-title" value={values.role} onChange={set('role')} placeholder="e.g. Barista" className={`${controlCls} ${border('role')}`} />
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
                    <input {...a11y('social')} type="text" autoCapitalize="none" value={values.social} onChange={set('social')} placeholder="@handle" className={`${controlCls} ${border('social')}`} />
                  </Field>
                </Group>

                <Group index="03" title="Championship">
                  <Field
                    id={id('previousCompetition')}
                    label="Previous competition experience"
                    hint="Competitions entered and rounds reached — or “none yet”."
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
                  <Field id={id('photo')} label="Profile photo" error={show('photo')}>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault()
                        setDragging(true)
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={onDrop}
                      className={`flex h-12 min-w-0 items-center gap-3 rounded-[3px] border border-dashed bg-white/50 pr-2 pl-1.5 transition-colors focus-within:ring-[3px] focus-within:ring-accent/25 ${
                        dragging ? 'border-accent bg-accent/5' : show('photo') ? 'border-accent-deep' : 'border-ink/30'
                      }`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[2px] bg-paper">
                        {photoUrl ? (
                          <img src={photoUrl} alt="Selected profile photo" className="h-full w-full object-cover" />
                        ) : (
                          <ImagePlus size={16} strokeWidth={1.5} className="text-ink/50" />
                        )}
                      </span>
                      {photo ? (
                        <>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium">{photo.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              pickPhoto(null)
                              if (fileRef.current) fileRef.current.value = ''
                            }}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink/60 hover:bg-ink/5 hover:text-accent-deep"
                            aria-label="Remove photo"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <label htmlFor={id('photo')} className="min-w-0 flex-1 cursor-pointer truncate text-sm">
                          <span className="font-medium underline decoration-accent underline-offset-4">Choose image</span>
                          <span className="hidden text-ink/50 min-[360px]:inline"> · max {MAX_PHOTO_MB} MB</span>
                        </label>
                      )}
                      <input
                        ref={fileRef}
                        {...a11y('photo')}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => pickPhoto(e.target.files?.[0])}
                        className="sr-only"
                      />
                    </div>
                  </Field>
                </Group>

                <div className="mt-8 border-t border-ink/10 pt-6">
                  {status === 'error' && (
                    <p role="alert" className="mb-5 border-l-2 border-accent pl-3 text-sm text-accent-deep">
                      Something went wrong sending your application. Please try again in a moment.
                    </p>
                  )}
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-8">
                    <div>
                      <label htmlFor={id('confirm')} className="flex cursor-pointer items-start gap-3">
                        <input {...a11y('confirm')} type="checkbox" checked={values.confirm} onChange={set('confirm')} className="peer sr-only" />
                        <span
                          className={`mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-[3px] border transition-colors peer-focus-visible:ring-[3px] peer-focus-visible:ring-accent/40 ${
                            values.confirm ? 'border-espresso bg-espresso text-cream' : show('confirm') ? 'border-accent-deep bg-white/70' : 'border-ink/40 bg-white/70'
                          }`}
                          aria-hidden="true"
                        >
                          {values.confirm && <Check size={13} strokeWidth={3} />}
                        </span>
                        <span className="text-sm leading-snug">
                          I confirm that the information provided is accurate.
                          <span className="text-accent-deep" aria-hidden="true">
                            {' '}*
                          </span>
                        </span>
                      </label>
                      {show('confirm') && (
                        <p id={`${id('confirm')}-error`} className="mt-1.5 ml-8 text-[0.8rem] font-medium text-accent-deep">
                          {errors.confirm}
                        </p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="group inline-flex h-13 w-full shrink-0 items-center justify-center gap-3 rounded-[3px] bg-espresso px-5 text-[0.72rem] font-semibold tracking-[0.16em] whitespace-nowrap sm:px-7 sm:tracking-[0.2em] text-cream uppercase transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-accent/40 disabled:opacity-70 md:w-auto"
                    >
                      {status === 'sending' ? 'Submitting…' : 'Submit application'}
                      {status === 'sending' ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                      )}
                    </button>
                  </div>
                  <p className="mt-4 text-xs text-ink/55" aria-live="polite">
                    {submitted && errorCount > 0
                      ? `Please check the ${errorCount === 1 ? 'highlighted field' : `${errorCount} highlighted fields`}.`
                      : <>Fields marked <span className="text-accent-deep">*</span> are required. No payment is collected through this form.</>}
                  </p>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

import { AnimatePresence, motion } from 'framer-motion'
import { Check, Loader2, Phone, Send, X } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { sponsorContact, sponsorTiers } from '../data/event'
import { emailReady, sendEmail } from '../lib/sendEmail'
import { EASE } from './ui'

const inputCls =
  'block h-12 w-full min-w-0 rounded-xl border-2 border-blue/15 bg-cream/60 px-4 text-[0.95rem] font-medium text-navy placeholder:text-navy/40 hover:border-blue/35 focus:border-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-yellow/70'

function BecomeSponsor({ onDone }: { onDone: () => void }) {
  const uid = useId()
  const [v, setV] = useState({ name: '', contact: '', email: '', company: '' })
  const [tried, setTried] = useState(false)
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const missing = !v.name.trim() || !v.contact.trim()
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((o) => ({ ...o, [k]: e.target.value }))

  const whatsappText = () =>
    [
      'Interested in Sponsorship or Vendor Details – Cup Tasters Championship 2026',
      `Name: ${v.name.trim()}`,
      `Contact: ${v.contact.trim()}`,
      `Email: ${v.email.trim() || '-'}`,
      `Company: ${v.company.trim() || '-'}`,
    ].join('\n')
  const whatsappUrl = () => `https://wa.me/${sponsorContact.whatsapp}?text=${encodeURIComponent(whatsappText())}`

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setTried(true)
    if (missing) return
    // Honeypot: bots fill hidden fields.
    if ((e.currentTarget.elements.namedItem('bcs_hp_x9') as HTMLInputElement | null)?.value) return
    if (!emailReady) {
      window.open(whatsappUrl(), '_blank', 'noopener')
      return
    }
    setState('sending')
    try {
      await sendEmail({
        subject: `New sponsor enquiry: ${v.company.trim() || v.name.trim()}`,
        heading: 'New sponsorship / vendor enquiry',
        replyTo: v.email.trim(),
        sections: [
          {
            title: 'Enquiry',
            rows: [
              ['Name', v.name.trim()],
              ['Contact number', v.contact.trim()],
              ['Email', v.email.trim()],
              ['Company', v.company.trim()],
            ],
          },
        ],
      })
      setState('done')
    } catch {
      setState('error')
    }
  }

  if (state === 'done')
    return (
      <div className="bg-white p-6 text-navy sm:p-8" role="status">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue text-yellow">
          <Check size={22} strokeWidth={3} />
        </span>
        <p className="headline mt-5 text-[clamp(1.5rem,2.6vw,2rem)] text-blue">Thank you, {v.name.trim()}!</p>
        <p className="mt-2 font-medium text-navy/75">
          We've received your enquiry. The Cup Tasters team will contact you soon. For anything urgent, call{' '}
          <a href={`tel:+977${sponsorContact.phone}`} className="font-bold">
            {sponsorContact.phone}
          </a>
          .
        </p>
        <button type="button" onClick={onDone} className="btn mt-6 bg-blue text-white hover:bg-red-deep">
          Close
        </button>
      </div>
    )

  const field = (k: keyof typeof v, label: string, props: Record<string, string> = {}, required = false) => (
    <div className="min-w-0">
      <label htmlFor={`${uid}-${k}`} className="mb-1.5 block text-[0.7rem] font-bold tracking-[0.12em] text-navy/85 uppercase">
        {label}
        {required && <span className="ml-0.5 text-red-deep">*</span>}
      </label>
      <input id={`${uid}-${k}`} value={v[k]} onChange={set(k)} className={inputCls} {...props} />
    </div>
  )

  return (
    <form onSubmit={submit} noValidate className="relative bg-white p-5 pt-6 text-navy sm:p-8">
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Leave this empty <input type="text" name="bcs_hp_x9" tabIndex={-1} autoComplete="new-password" defaultValue="" />
        </label>
      </div>
      <p className="headline pr-12 text-[clamp(1.5rem,2.6vw,2rem)] text-blue">Become a sponsor</p>
      <p className="mt-1 text-sm font-medium text-navy/70">Interested in sponsorship or vendor details? Tell us about you.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {field('name', 'Name', { autoComplete: 'name' }, true)}
        {field('contact', 'Contact', { type: 'tel', inputMode: 'tel', autoComplete: 'tel', placeholder: '98XXXXXXXX' }, true)}
        {field('email', 'Email', { type: 'email', autoComplete: 'email' })}
        {field('company', 'Company', { autoComplete: 'organization' })}
      </div>
      {state === 'error' && (
        <p role="alert" className="mt-4 rounded-xl bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
          Something went wrong sending your enquiry.{' '}
          <a href={whatsappUrl()} target="_blank" rel="noreferrer" className="underline">
            Send it on WhatsApp instead
          </a>{' '}
          or call us.
        </p>
      )}
      {tried && missing && (
        <p className="mt-4 text-[0.8rem] font-semibold text-danger">Please fill in your name and contact number.</p>
      )}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" disabled={state === 'sending'} className="btn justify-center bg-blue text-white hover:bg-red-deep disabled:opacity-70">
          {state === 'sending' ? 'Sending…' : emailReady ? 'Send enquiry' : 'Send on WhatsApp'}
          {state === 'sending' ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
        <a href={`tel:+977${sponsorContact.phone}`} className="flex items-center gap-2 text-sm font-semibold text-navy/75 hover:text-blue">
          <Phone size={15} /> Or call directly: <span className="font-bold">{sponsorContact.phone}</span>
        </a>
      </div>
    </form>
  )
}

/** Letters that drop in one by one, sit at jaunty angles and hop when hovered. */
function PlayfulLetters({
  text,
  offset = 0,
  colors,
}: {
  text: string
  offset?: number
  colors?: string[]
}) {
  return (
    <>
      {text.split('').map((ch, i) => {
        const n = i + offset
        const tilt = [-6, 4, -3, 6, -4, 3][n % 6]
        return (
          <motion.span
            key={i}
            className="inline-block cursor-default"
            style={colors ? { color: colors[i % colors.length] } : undefined}
            initial={{ y: '-60%', opacity: 0, rotate: 0 }}
            whileInView={{ y: 0, opacity: 1, rotate: tilt }}
            whileHover={{ y: '-18%', rotate: -tilt, scale: 1.15 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 420, damping: 14, delay: n * 0.05 }}
          >
            {ch}
          </motion.span>
        )
      })}
    </>
  )
}

function SponsorModal({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prev?.focus()
    }
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-navy/75 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Become a sponsor"
    >
      <motion.div
        className="relative max-h-[92svh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] sm:rounded-[2rem]"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-cream text-navy hover:bg-yellow"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        <BecomeSponsor onDone={onClose} />
      </motion.div>
    </motion.div>
  )
}

export function Sponsorship() {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  return (
    <section id="sponsors" className="relative overflow-hidden bg-white text-navy">
      <div className="wrap relative py-14 md:py-20">
        <div className="flex flex-col items-center text-center">
          <h2
            className="headline flex flex-wrap items-end justify-center gap-x-[0.25em] text-[clamp(2.4rem,6vw,4.5rem)] leading-[0.95]"
            aria-label="Our sponsors"
          >
            <span aria-hidden="true" className="text-blue">
              <PlayfulLetters text="Our" />
            </span>
            <span aria-hidden="true" className="relative">
              {/* marker swipe behind the word */}
              <motion.span
                className="absolute inset-x-[-0.12em] bottom-[0.06em] -z-0 h-[0.42em] origin-left -rotate-2 rounded-full bg-gold/45"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.55 }}
              />
              <span className="relative">
                <PlayfulLetters text="sponsors!" offset={3} colors={['var(--color-red-deep)', 'var(--color-blue)']} />
              </span>
            </span>
          </h2>
          <motion.p
            className="mt-5 max-w-xl text-[1.05rem] font-semibold text-navy/75"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.7 }}
          >
            The brands bringing Nepal&rsquo;s{' '}
            <span className="relative inline-block font-extrabold text-red-deep">
              biggest
              <svg viewBox="0 0 100 8" preserveAspectRatio="none" className="absolute inset-x-0 -bottom-1.5 h-2 w-full" aria-hidden="true">
                <motion.path
                  d="M2 5 Q 12 1 22 5 T 42 5 T 62 5 T 82 5 T 98 5"
                  fill="none"
                  stroke="var(--color-red)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: EASE, delay: 1 }}
                />
              </svg>
            </span>{' '}
            coffee tasting challenge to life.
          </motion.p>
        </div>

        <ul className="mx-auto mt-12 flex max-w-5xl flex-wrap items-start justify-center gap-x-6 gap-y-10 sm:gap-x-10">
          {sponsorTiers.map((t, i) => {
            const body = (
              <>
                <span className="eyebrow mb-3 rounded-full bg-blue px-3 py-1 text-[0.62rem] text-white">{t.tier}</span>
                <span className={`flex aspect-square w-[clamp(8rem,14vw,10rem)] items-center justify-center rounded-full ${t.dark ? 'bg-blue' : 'bg-white'} shadow-[0_4px_0_0_var(--color-blue)] ring-2 ring-blue transition-transform duration-500 group-hover:scale-105`}>
                  {t.logo ? (
                    <img src={t.logo} alt="" loading="lazy" className="max-h-[70%] max-w-[80%] object-contain" />
                  ) : (
                    <span className="flex h-[86%] w-[86%] items-center justify-center rounded-full border-2 border-dashed border-blue/30">
                      <span className="headline text-[0.8rem] leading-tight text-navy/40">
                        To be
                        <br />
                        determined
                      </span>
                    </span>
                  )}
                </span>
                <span className="mt-4 block max-w-[11rem] text-[0.72rem] leading-tight font-extrabold tracking-[0.12em] text-navy uppercase">
                  {t.name ?? 'To be determined'}
                </span>
              </>
            )
            const cls = 'group flex flex-col items-center text-center'
            return (
              <motion.li
                key={t.tier}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
              >
                {t.href ? (
                  <a href={t.href} target="_blank" rel="noreferrer" className={cls} aria-label={`${t.tier}: ${t.name}`}>
                    {body}
                  </a>
                ) : (
                  <div className={cls}>{body}</div>
                )}
              </motion.li>
            )
          })}
        </ul>

        <div className="mt-14 flex flex-col items-center gap-3 text-center">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="btn group bg-blue py-4 text-yellow shadow-[0_6px_0_-1px_var(--color-red-deep)] hover:bg-red-deep hover:text-white"
          >
            Become a sponsor
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </button>
          <p className="text-sm font-semibold text-navy/80">
            Interested in sponsorship or vendor details? Or call{' '}
            <a href={`tel:+977${sponsorContact.phone}`} className="font-bold whitespace-nowrap text-blue underline decoration-red decoration-2 underline-offset-4">
              {sponsorContact.phone}
            </a>
          </p>
        </div>
      </div>

      <AnimatePresence>{open && <SponsorModal onClose={close} />}</AnimatePresence>
    </section>
  )
}

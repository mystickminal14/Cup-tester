import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, Clock, MapPin, Users } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { event, openTo } from '../data/event'
import { EASE, Burst, Tba } from './ui'

type Parts = { days: number; hours: number; mins: number; secs: number }

function partsUntil(target: number): Parts | null {
  const ms = target - Date.now()
  if (ms <= 0) return null
  const s = Math.floor(ms / 1000)
  return { days: Math.floor(s / 86400), hours: Math.floor(s / 3600) % 24, mins: Math.floor(s / 60) % 60, secs: s % 60 }
}

function useCountdown(iso: string | null) {
  const target = iso ? new Date(iso).getTime() : null
  const [parts, setParts] = useState(() => (target ? partsUntil(target) : null))
  useEffect(() => {
    if (!target) return
    const id = window.setInterval(() => setParts(partsUntil(target)), 1000)
    return () => window.clearInterval(id)
  }, [target])
  return parts
}

/** One digit that rolls in from below when it changes. */
function RollingDigit({ d }: { d: string }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={d}
          className="absolute inset-0 text-center"
          initial={{ y: '100%' }}
          animate={{ y: '0%' }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          {d}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function Unit({ value, label, onDark, pad = 2 }: { value: number; label: string; onDark?: boolean; pad?: number }) {
  const digits = String(value).padStart(pad, '0').split('')
  return (
    <div className="flex flex-col items-center">
      <span className="sticker headline flex rounded-xl bg-white px-1.5 pt-2 pb-1 text-[clamp(1.5rem,min(3vw,4.5svh),2.2rem)] leading-none text-blue tabular-nums">
        {digits.map((d, i) => (
          <RollingDigit key={digits.length - i} d={d} />
        ))}
      </span>
      <span
        className={`mt-2 text-[0.62rem] font-extrabold tracking-[0.16em] uppercase ${onDark ? 'text-(--c-muted)' : 'text-navy/70'}`}
      >
        {label}
      </span>
    </div>
  )
}

/** `onDark` for use inside a themed dark section (reads its `--c-*` colours). */
export function Countdown({ onDark = false }: { onDark?: boolean }) {
  const iso = event.date.startISO ?? event.date.tentativeISO
  const parts = useCountdown(iso)
  if (!iso) return onDark ? null : <Tba>Countdown starts once the date is set</Tba>
  if (!parts)
    return (
      <p className={`headline text-[1.6rem] ${onDark ? 'text-(--c-accent)' : 'text-red-deep'}`}>It&rsquo;s tasting day!</p>
    )
  return (
    <div className="flex items-start gap-2 sm:gap-3" role="timer" aria-live="off">
      <Unit value={parts.days} label="Days" onDark={onDark} />
      <Unit value={parts.hours} label="Hours" onDark={onDark} />
      <Unit value={parts.mins} label="Mins" onDark={onDark} />
      <Unit value={parts.secs} label="Secs" onDark={onDark} />
    </div>
  )
}

function Fact({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue text-yellow">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="eyebrow text-blue">{label}</p>
        <div className="mt-1 text-[1rem] leading-snug font-semibold">{children}</div>
      </div>
    </div>
  )
}

/** Key facts + live countdown, closing the hero. */
export function EventStrip() {
  return (
    <motion.div
      role="region"
      aria-label="Event at a glance"
      className="sticker relative grid gap-6 rounded-[2rem] bg-cream px-5 py-6 text-navy sm:px-8 lg:grid-cols-12 lg:items-center lg:gap-8 lg:py-5"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      <span className="headline absolute -top-5 left-6 -rotate-2 bg-yellow px-4 py-1.5 text-[1.1rem] text-navy sm:left-8">
        Event details
      </span>
      <Burst className="absolute -top-4 -right-3 h-9 w-9" color="var(--color-yellow)" />

      <div className="grid gap-5 sm:grid-cols-2 lg:col-span-5">
        <Fact icon={<CalendarDays size={20} />} label="Date">
          {event.date.label ?? 'Coming soon'}
        </Fact>
        <Fact icon={<MapPin size={20} />} label="Venue">
          {event.venue.name && event.venue.mapUrl ? (
            <a
              href={event.venue.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-yellow decoration-2 underline-offset-4 hover:text-blue"
            >
              {event.venue.name}
            </a>
          ) : (
            (event.venue.name ?? event.city.split(',')[0])
          )}
          <span className="mt-1 block text-xs font-medium text-navy/65">
            {event.venue.name ? (event.venue.address ?? event.city) : 'Venue to be announced'}
          </span>
        </Fact>
      </div>

      <div className="border-blue/15 md:border-y-2 md:border-dashed md:py-5 lg:col-span-4 lg:border-x-2 lg:border-y-0 lg:px-6 lg:py-0">
        <p className="eyebrow mb-3 flex items-center gap-2 text-blue">
          <Clock size={15} strokeWidth={2.5} /> Countdown
        </p>
        <Countdown />
      </div>

      <div className="lg:col-span-3">
        <Fact icon={<Users size={20} />} label="Open for">
          {openTo}
        </Fact>
      </div>
    </motion.div>
  )
}

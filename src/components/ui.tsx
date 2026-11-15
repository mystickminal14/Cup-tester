import { motion, useInView, animate, type Variants } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import logoUrl from '../assets/bcs-logo.png'

export const EASE = [0.22, 1, 0.36, 1] as const

/** The Barista's Coffee School roundel, on a white disc as on the poster. */
export function BrandLogo({ size = 44, className = '' }: { size?: number; className?: string }) {
  return (
    <img
      src={logoUrl}
      alt=""
      width={size}
      height={size}
      className={`shrink-0 rounded-full bg-white p-[3px] ${className}`}
      aria-hidden="true"
    />
  )
}

/** Official Cup Tasters Championship logo (yellow + white, transparent). */
export function CupTastersLogo({ className = '' }: { className?: string }) {
  return (
    <img
      src="/images/cup-tasters-logo.webp"
      alt="Cup Tasters Championship"
      width={800}
      height={613}
      className={`block w-auto shrink-0 ${className}`}
    />
  )
}

/**
 * The cupping cup motif.
 * `filled` pours red coffee into the cup (the "odd" cup).
 */
export function CupMark({
  size = 18,
  filled = true,
  className = '',
  stroke = 'currentColor',
}: {
  size?: number
  filled?: boolean
  className?: string
  stroke?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 2.5c-.9 1 .9 2 0 3M12.5 2.5c-.9 1 .9 2 0 3" opacity={0.7} />
      {filled && <path d="M4.6 10.5h12.8V12a6.4 6.4 0 0 1-12.8 0z" fill="var(--color-red)" stroke="none" />}
      <path d="M3.5 8.5h15V12a7.5 7.5 0 0 1-15 0z" />
      <path d="M18.5 10h.75a2.5 2.5 0 0 1 0 5H18" />
      <path d="M2.5 21.5h17" />
    </svg>
  )
}

/** Numbered section kicker. */
export function SectionLabel({
  index,
  children,
  className = '',
}: {
  index: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`eyebrow flex items-center gap-3 ${className}`}>
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-current/15 text-[0.65rem] tracking-normal tabular-nums">
        {index}
      </span>
      <span>{children}</span>
    </div>
  )
}

/* ── Doodles ─────────────────────────────────────────────────────────────── */

type DoodleProps = { className?: string; color?: string; draw?: boolean }

function useDraw(draw: boolean | undefined) {
  return draw
    ? {
        initial: { pathLength: 0 },
        whileInView: { pathLength: 1 },
        viewport: { once: true, margin: '-10% 0px' },
        transition: { duration: 1.4, ease: EASE },
      }
    : {}
}

export function DoodleArrow({ className = '', color = 'var(--color-sky)', draw = true }: DoodleProps) {
  const d = useDraw(draw)
  return (
    <svg viewBox="0 0 120 60" fill="none" className={className} aria-hidden="true">
      <motion.path d="M3 52C30 50 70 40 108 12" stroke={color} strokeWidth={2.5} strokeLinecap="round" {...d} />
      <path d="M92 10l16 2-5 15" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Four-point sparkle: a clean accent in place of loose scribbled strokes. */
export function Burst({ className = '', color = 'var(--color-gold)' }: Omit<DoodleProps, 'draw'>) {
  return (
    <svg viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
      <path d="M12 1.5c.9 5.6 4.9 9.6 10.5 10.5-5.6.9-9.6 4.9-10.5 10.5C11.1 16.9 7.1 12.9 1.5 12 7.1 11.1 11.1 7.1 12 1.5Z" />
    </svg>
  )
}

/** Gold shapes cut from the 2026 poster artwork (one file per piece), floating gently. */
export function Deco({
  kind,
  className = '',
  float = true,
  delay = 0,
}: {
  kind: 'flower' | 'spoon' | 'leaf' | 'leaves'
  className?: string
  float?: boolean
  delay?: number
}) {
  return (
    <motion.img
      src={`/images/poster/${kind}.webp`}
      alt=""
      aria-hidden="true"
      loading="lazy"
      className={`pointer-events-none absolute select-none ${float ? 'float-slow' : ''} ${className}`}
      style={{ animationDelay: `${delay}s` }}
      initial={{ opacity: 0, scale: 0.4, rotate: -25 }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.2 + delay }}
    />
  )
}

/* ── Motion helpers ──────────────────────────────────────────────────────── */

/** Fade + rise once when scrolled into view. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className = '',
  as = 'div',
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  as?: 'div' | 'li' | 'p' | 'span'
}) {
  const Comp = motion[as]
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </Comp>
  )
}

const lineParent: Variants = {
  hidden: {},
  show: (stagger: number) => ({ transition: { staggerChildren: stagger } }),
}
const lineChild: Variants = {
  hidden: { y: '110%' },
  show: { y: '0%', transition: { duration: 1.05, ease: EASE } },
}

/**
 * Masked line-by-line typographic reveal. Pass each line as an array item.
 * Use `animateOnMount` for above-the-fold headlines.
 */
export function SplitLines({
  lines,
  className = '',
  lineClassName = '',
  stagger = 0.09,
  delay = 0,
  animateOnMount = false,
  as = 'h2',
}: {
  lines: ReactNode[]
  className?: string
  lineClassName?: string | ((i: number) => string)
  stagger?: number
  delay?: number
  animateOnMount?: boolean
  as?: 'h1' | 'h2' | 'h3' | 'p'
}) {
  const Comp = motion[as]
  const trigger = animateOnMount
    ? { animate: 'show' as const }
    : { whileInView: 'show' as const, viewport: { once: true, margin: '-12% 0px' } }
  return (
    <Comp
      className={className}
      variants={lineParent}
      custom={stagger}
      initial="hidden"
      transition={{ delayChildren: delay }}
      {...trigger}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span
            variants={lineChild}
            className={`block ${typeof lineClassName === 'function' ? lineClassName(i) : lineClassName}`}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Comp>
  )
}

/** Counts up to a real, published number. Do not use for placeholders. */
export function Counter({ value, className = '' }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (!inView) return
    const controls = animate(0, value, {
      duration: 1.4,
      ease: EASE,
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, value])
  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {String(display).padStart(2, '0')}
    </span>
  )
}

/** Muted placeholder for unconfirmed information. */
export function Tba({ children = 'To be announced', className = '' }: { children?: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-red" aria-hidden="true" />
      <span className="italic opacity-80">{children}</span>
    </span>
  )
}

/** Cupping cup with rising steam and a gently sloshing coffee line. */
export function SteamCup({ className = '', fill = 'var(--color-yellow)' }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      {[22, 32, 42].map((x, i) => (
        <motion.path
          key={x}
          d={`M${x} 20c-4-4 4-7 0-12`}
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          animate={{ opacity: [0, 1, 0], y: [3, -3, -7] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.45, ease: 'easeInOut' }}
        />
      ))}
      <path d="M8 26h44v6a22 22 0 0 1-44 0z" fill={fill} stroke="var(--color-navy)" strokeWidth={3.5} strokeLinejoin="round" />
      <motion.path
        d="M12 31c5-2 9 2 14 0s9-2 14 0 7 1 8 0"
        stroke="var(--color-bean)"
        strokeWidth={3}
        strokeLinecap="round"
        animate={{ x: [-2, 2, -2] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <path d="M52 30h3a6 6 0 0 1 0 12h-4" stroke="var(--color-navy)" strokeWidth={3.5} strokeLinecap="round" />
      <path d="M14 60h32" stroke="var(--color-navy)" strokeWidth={3.5} strokeLinecap="round" />
    </svg>
  )
}

import { motion, useInView, animate, type Variants } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import logoUrl from '../assets/bcs-logo.png'

export const EASE = [0.22, 1, 0.36, 1] as const

/** The Barista's Coffee School roundel. */
export function BrandLogo({ size = 44, className = '' }: { size?: number; className?: string }) {
  return (
    <img
      src={logoUrl}
      alt=""
      width={size}
      height={size}
      className={`shrink-0 rounded-full ring-1 ring-paper/40 ${className}`}
      aria-hidden="true"
    />
  )
}

/**
 * The brand motif: a cupping cup with rising steam.
 * `filled` pours coffee into the cup in the accent colour (the "odd" cup).
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
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 2.5c-.9 1 .9 2 0 3M12.5 2.5c-.9 1 .9 2 0 3" opacity={0.7} />
      {filled && <path d="M4.6 10.5h12.8V12a6.4 6.4 0 0 1-12.8 0z" fill="var(--color-accent)" stroke="none" />}
      <path d="M3.5 8.5h15V12a7.5 7.5 0 0 1-15 0z" />
      <path d="M18.5 10h.75a2.5 2.5 0 0 1 0 5H18" />
      <path d="M2.5 21.5h17" />
    </svg>
  )
}

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
      <CupMark size={18} />
      <span className="tabular-nums opacity-60">{index}</span>
      <span>{children}</span>
    </div>
  )
}

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
        <span key={i} className="block overflow-hidden pb-[0.06em] -mb-[0.06em]">
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

/** Image that wipes in from a mask the first time it scrolls into view. */
export function MaskedImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  direction = 'up',
}: {
  src: string
  alt: string
  className?: string
  imgClassName?: string
  direction?: 'up' | 'left' | 'right'
}) {
  const from = {
    up: 'inset(100% 0% 0% 0%)',
    left: 'inset(0% 100% 0% 0%)',
    right: 'inset(0% 0% 0% 100%)',
  }[direction]
  return (
    <motion.div
      className={`overflow-hidden ${className}`}
      initial={{ clipPath: from }}
      whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 1.3, ease: EASE }}
    >
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`h-full w-full object-cover ${imgClassName}`}
        initial={{ scale: 1.18 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 1.8, ease: EASE }}
      />
    </motion.div>
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
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
      <span className="italic opacity-70">{children}</span>
    </span>
  )
}

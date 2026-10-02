import { motion, useInView, animate, type Variants } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'

export const EASE = [0.22, 1, 0.36, 1] as const

/**
 * The brand motif: three cups in a triangle, one of them different.
 * `odd` picks which cup is filled (0 = top, 1 = bottom-left, 2 = bottom-right).
 */
export function TriMark({
  size = 18,
  odd = 2,
  className = '',
  stroke = 'currentColor',
}: {
  size?: number
  odd?: 0 | 1 | 2
  className?: string
  stroke?: string
}) {
  const pts: [number, number][] = [
    [12, 5],
    [5, 18],
    [19, 18],
  ]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      {pts.map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={3.6}
          fill={i === odd ? 'var(--color-accent)' : 'none'}
          stroke={i === odd ? 'var(--color-accent)' : stroke}
          strokeWidth={1.4}
        />
      ))}
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
      <TriMark size={16} />
      <span className="tabular-nums opacity-60">{index}</span>
      <span className="h-px w-8 bg-current opacity-30" />
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

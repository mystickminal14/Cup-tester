import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Check, Droplets, Eye, Target, Timer, Wind, X, type LucideIcon } from 'lucide-react'
import { Bowl } from './TriangulationDiagram'
import { EASE, SplitLines } from './ui'

const steps: { word: string; text: string; icon: LucideIcon; tile: string; tilt: string }[] = [
  {
    word: 'Aroma',
    text: 'The first clue arrives before the first sip.',
    icon: Wind,
    tile: 'bg-red-deep text-white',
    tilt: '-rotate-2',
  },
  {
    word: 'Taste',
    text: 'Acidity, body and sweetness, measured against memory.',
    icon: Droplets,
    tile: 'bg-yellow text-navy',
    tilt: 'rotate-1',
  },
  {
    word: 'Attention',
    text: 'Three cups. No distractions. No second-guessing.',
    icon: Eye,
    tile: 'bg-sky text-navy',
    tilt: '-rotate-1',
  },
  {
    word: 'Decision',
    text: 'Point to one cup. Commit.',
    icon: Target,
    tile: 'bg-blue text-white',
    tilt: 'rotate-2',
  },
  {
    word: 'Speed',
    text: 'When answers match, the clock decides.',
    icon: Timer,
    tile: 'bg-gold text-navy',
    tilt: '-rotate-1',
  },
]

const HOLD = 0.85

function Stopwatch({ progress, active }: { progress: MotionValue<number>; active: number }) {
  const rotate = useTransform(progress, [0, 1], [0, 360])
  return (
    <div className="relative aspect-[320/340] w-full">
      <svg viewBox="0 0 320 340" className="h-full w-full" aria-hidden="true">
        {/* crown */}
        <rect x={146} y={0} width={28} height={14} rx={4} fill="var(--color-yellow)" />
        <rect x={154} y={12} width={12} height={12} fill="var(--color-yellow)" />
        <g transform="translate(0 20)">
          <circle cx={160} cy={160} r={150} fill="rgb(255 255 255 / 0.06)" stroke="rgb(255 255 255 / 0.2)" strokeWidth={2} />
          <motion.circle
            cx={160}
            cy={160}
            r={150}
            fill="none"
            stroke="var(--color-yellow)"
            strokeWidth={6}
            strokeLinecap="round"
            style={{ pathLength: progress, rotate: -90, transformOrigin: '50% 50%' }}
          />
          {Array.from({ length: 60 }).map((_, i) => {
            const major = i % 5 === 0
            const a = (i / 60) * Math.PI * 2
            const r1 = major ? 122 : 132
            return (
              <line
                key={i}
                x1={160 + Math.sin(a) * r1}
                y1={160 - Math.cos(a) * r1}
                x2={160 + Math.sin(a) * 140}
                y2={160 - Math.cos(a) * 140}
                stroke={major ? 'rgb(255 255 255 / 0.85)' : 'rgb(255 255 255 / 0.3)'}
                strokeWidth={major ? 3 : 1.5}
                strokeLinecap="round"
              />
            )
          })}
          {/* Only the hand turns. framer-motion rotates SVG around the
              element's own bounding box, so an invisible full-face circle
              keeps that box centred on the pivot. The knob stays fixed. */}
          <motion.g style={{ rotate, transformOrigin: '50% 50%' }}>
            <circle cx={160} cy={160} r={150} fill="none" stroke="none" />
            <line x1={160} y1={184} x2={160} y2={36} stroke="var(--color-yellow)" strokeWidth={5} strokeLinecap="round" />
          </motion.g>
          <circle cx={160} cy={160} r={10} fill="var(--color-red-deep)" stroke="var(--color-yellow)" strokeWidth={4} />
        </g>
      </svg>
      <div className="pointer-events-none absolute inset-x-0 top-[62%] text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={active}
            className="headline text-[clamp(0.95rem,1.6vw,1.35rem)] text-yellow"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {steps[active].word}
          </motion.p>
        </AnimatePresence>
        <p className="mt-0.5 text-[0.7rem] font-extrabold tracking-[0.14em] text-white/60 tabular-nums">
          0{active + 1} / 0{steps.length}
        </p>
      </div>
    </div>
  )
}

/**
 * The event motto, then the five things a round asks of a competitor, with a
 * stopwatch whose hand follows the scroll through them.
 */
export function ChallengeSection() {
  // The stage sticks, centred below the navbar, while the steps play out; the
  // clock reaches Speed at HOLD of the way through, holds, then the page
  // scrolls on. Progress runs exactly over the pinned stretch, so it needs the
  // stage's sticky top and height.
  const pinRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState({ top: 96, height: 600 })
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const measure = () => {
      const nav = window.matchMedia('(min-width: 48rem)').matches ? 96 : 80
      const height = el.offsetHeight
      setStage({ top: Math.round(nav + Math.max(0, (window.innerHeight - nav - height) / 2)), height })
    }
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])
  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: [`start ${stage.top}px`, `end ${stage.top + stage.height}px`],
  })
  const clock = useTransform(scrollYProgress, [0, HOLD], [0, 1])
  const [active, setActive] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setActive(Math.min(steps.length - 1, Math.max(0, Math.floor((v / HOLD) * steps.length))))
  })
  const current = steps[active]
  const CurrentIcon = current.icon

  return (
    <div id="challenge" className="relative bg-cream pb-[clamp(3rem,min(7vw,8.5svh),6.5rem)]">
      <div className="wrap">
        <div className="relative rounded-[2rem] bg-navy px-5 py-12 text-white sm:px-10 md:py-[min(4rem,8svh)] lg:px-14">
          {/* The event motto, played out as a triangulation */}
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-8">
            <div className="lg:col-span-7">
              <SplitLines
                as="h3"
                className="headline"
                lines={[
                  <span key="1" className="text-[clamp(1.4rem,min(2.6vw,4.5svh),2.3rem)] text-white/55">
                    It&rsquo;s not about the color,
                  </span>,
                  <span key="2" className="text-[clamp(1.4rem,min(2.6vw,4.5svh),2.3rem)] text-white/55">
                    it&rsquo;s not about the taste,
                  </span>,
                  <span key="3" className="mt-3 block text-[clamp(1.9rem,min(3.8vw,6svh),3.2rem)]">
                    it&rsquo;s all about the
                  </span>,
                  <span key="4" className="text-[clamp(3rem,min(7.5vw,12svh),6.5rem)] text-yellow [text-shadow:0.05em_0.06em_0_var(--color-red-deep)]">
                    odd cup out.
                  </span>,
                ]}
                stagger={0.16}
              />
            </div>

            <ul className="grid grid-cols-3 items-end gap-3 sm:gap-5 lg:col-span-5" aria-hidden="true">
              {['Color', 'Taste', 'Odd cup'].map((label, i) => {
                const odd = i === 2
                return (
                  <motion.li
                    key={label}
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: odd ? -18 : 0 }}
                    viewport={{ once: true, margin: '-10% 0px' }}
                    transition={{ type: 'spring', stiffness: 160, damping: 14, delay: 0.4 + i * 0.25 }}
                  >
                    {odd && (
                      <span className="headline mb-2 -rotate-6 rounded-lg bg-red-deep px-2.5 py-1 text-[0.85rem] text-white">
                        This one!
                      </span>
                    )}
                    <div className={`w-full ${odd ? '' : 'opacity-45 grayscale'}`}>
                      <Bowl n={i} odd={odd} revealed picked={odd} />
                    </div>
                    <span
                      className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.72rem] font-extrabold tracking-[0.12em] uppercase ${
                        odd ? 'bg-yellow text-navy' : 'bg-white/10 text-white/60'
                      }`}
                    >
                      {odd ? <Check size={13} strokeWidth={3} /> : <X size={13} strokeWidth={3} />}
                      {label}
                    </span>
                  </motion.li>
                )
              })}
            </ul>
          </div>

          {/* Pinned stage: scrolling steps the clock from Aroma to Speed */}
          <div ref={pinRef} className="relative mt-14 md:mt-[min(5rem,9svh)]">
            <div ref={stageRef} className="sticky flex flex-col gap-[min(2rem,3.5svh)]" style={{ top: stage.top }}>
              <div className="flex items-center gap-4 sm:gap-8">
                <div className="w-[min(8.5rem,20svh)] shrink-0 sm:w-[min(10rem,22svh)] lg:w-[min(12rem,24svh)]">
                  <Stopwatch progress={clock} active={active} />
                </div>
                <div className="min-w-0">
                  <p className="headline text-[clamp(1.4rem,min(3.2vw,5svh),2.8rem)]">
                    Five tests. <span className="text-yellow">One clock.</span>
                  </p>
                  <p className="mt-2 max-w-md text-[clamp(0.85rem,2svh,0.95rem)] leading-snug font-semibold text-white/70">
                    Every round is timed. Here&rsquo;s what each tick of it asks of you.
                  </p>
                </div>
              </div>

              {/* Phones and tablets: one step at a time */}
              <div className="lg:hidden">
                <ol className="grid grid-cols-5 gap-1.5" aria-label="Steps">
                  {steps.map((s, i) => (
                    <li
                      key={s.word}
                      aria-current={i === active ? 'step' : undefined}
                      className={`truncate border-t-4 pt-1.5 text-[0.7rem] font-extrabold tracking-[0.08em] uppercase transition-colors duration-500 sm:text-[0.7rem] ${
                        i <= active ? 'border-yellow text-white' : 'border-white/15 text-white/40'
                      }`}
                    >
                      <span className="sm:hidden">0{i + 1}</span>
                      <span className="hidden sm:inline">{s.word}</span>
                    </li>
                  ))}
                </ol>
                <div className="relative mt-[min(1.25rem,2.5svh)] h-[min(15rem,34svh)]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={active}
                      className={`absolute inset-0 flex flex-col rounded-[1.5rem] p-5 sm:p-7 ${current.tile} ${current.tilt}`}
                      initial={{ opacity: 0, y: 40, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -30, scale: 0.96 }}
                      transition={{ duration: 0.35, ease: EASE }}
                    >
                      <div className="flex items-start justify-between">
                        <span className="headline text-[1.1rem] opacity-60">0{active + 1}</span>
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/25">
                          <CurrentIcon size={22} strokeWidth={2.25} />
                        </span>
                      </div>
                      <p className="headline mt-auto text-[clamp(1.6rem,min(7vw,5svh),2.4rem)]">{current.word}</p>
                      <p className="mt-1.5 max-w-sm text-[clamp(0.85rem,2.2svh,1rem)] leading-snug font-semibold">{current.text}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Desktop: all five tiles, the current one ringed */}
              <ol className="hidden grid-cols-5 gap-3 lg:grid">
                {steps.map((s, i) => {
                  const Icon = s.icon
                  const on = i === active
                  return (
                    <motion.li
                      key={s.word}
                      aria-current={on ? 'step' : undefined}
                      className={`group relative flex min-h-[min(15rem,26svh)] flex-col rounded-[1.5rem] p-5 transition-[transform,filter,box-shadow] duration-500 ease-(--ease-editorial) hover:rotate-0 hover:-translate-y-2 ${s.tile} ${s.tilt} ${
                        on ? 'ring-4 ring-white ring-offset-4 ring-offset-navy' : i > active ? 'brightness-50 saturate-50' : ''
                      }`}
                      initial={{ opacity: 0, y: 40, scale: 0.94 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, margin: '-10% 0px' }}
                      transition={{ duration: 0.8, ease: EASE, delay: i * 0.08 }}
                    >
                      <div className="flex items-start justify-between">
                        <span className="headline text-[1.1rem] opacity-60">0{i + 1}</span>
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/25 transition-transform duration-500 group-hover:rotate-12">
                          <Icon size={22} strokeWidth={2.25} />
                        </span>
                      </div>
                      <p className="headline mt-auto pt-6 text-[clamp(1.05rem,1.75vw,1.75rem)]">{s.word}</p>
                      <p className="mt-2 text-[0.9rem] leading-snug font-semibold">{s.text}</p>
                    </motion.li>
                  )
                })}
              </ol>
            </div>
            {/* Scroll distance for the pinned stage */}
            <div className="h-[160svh]" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  )
}

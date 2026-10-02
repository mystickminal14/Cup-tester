import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { useRef, useState } from 'react'
import { EASE, Reveal, SplitLines } from './ui'

const steps = [
  { word: 'Aroma', text: 'The first clue arrives before the first sip.' },
  { word: 'Taste', text: 'Acidity, body, sweetness — measured against memory.' },
  { word: 'Attention', text: 'Three cups. No distractions. No second-guessing.' },
  { word: 'Decision', text: 'Point to one cup. Commit.' },
  { word: 'Speed', text: 'When answers match, the clock decides.' },
]

function Stopwatch({ progress, active }: { progress: MotionValue<number>; active: number }) {
  const rotate = useTransform(progress, [0, 1], [0, 360])
  return (
    <div className="relative aspect-[320/340] w-full">
      <svg viewBox="0 0 320 340" className="h-full w-full" aria-hidden="true">
        {/* crown */}
        <rect x={148} y={0} width={24} height={14} fill="none" stroke="rgb(244 239 231 / 0.6)" strokeWidth={1.2} />
        <rect x={154} y={14} width={12} height={10} fill="rgb(244 239 231 / 0.6)" />
        <g transform="translate(0 20)">
          <circle cx={160} cy={160} r={150} fill="rgb(36 26 23 / 0.6)" stroke="rgb(244 239 231 / 0.18)" strokeWidth={1} />
          <motion.circle
            cx={160}
            cy={160}
            r={150}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={3}
            style={{ pathLength: progress, rotate: -90, transformOrigin: '160px 160px' }}
          />
          {Array.from({ length: 60 }).map((_, i) => {
            const major = i % 5 === 0
            const a = (i / 60) * Math.PI * 2
            const r1 = major ? 124 : 132
            return (
              <line
                key={i}
                x1={160 + Math.sin(a) * r1}
                y1={160 - Math.cos(a) * r1}
                x2={160 + Math.sin(a) * 140}
                y2={160 - Math.cos(a) * 140}
                stroke={major ? 'rgb(244 239 231 / 0.7)' : 'rgb(244 239 231 / 0.25)'}
                strokeWidth={major ? 2 : 1}
              />
            )
          })}
          <motion.g style={{ rotate, transformOrigin: '160px 160px' }}>
            <line x1={160} y1={182} x2={160} y2={34} stroke="var(--color-accent)" strokeWidth={3} />
            <circle cx={160} cy={160} r={7} fill="var(--color-accent)" />
          </motion.g>
          <circle cx={160} cy={160} r={2.5} fill="var(--color-espresso)" />
        </g>
      </svg>
      {/* readout — hidden on the small sticky dial */}
      <div className="pointer-events-none absolute inset-x-0 top-[63%] hidden text-center sm:block">
        <AnimatePresence mode="wait">
          <motion.p
            key={active}
            className="text-[clamp(1rem,2vw,1.6rem)] font-extrabold tracking-tight uppercase"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {steps[active].word}
          </motion.p>
        </AnimatePresence>
        <p className="eyebrow mt-1 text-cream/55 tabular-nums">
          0{active + 1} / 0{steps.length}
        </p>
      </div>
    </div>
  )
}

/**
 * "It's not about drinking coffee" — the five things a round asks of a
 * competitor, with a stopwatch whose hand follows the scroll.
 */
export function ChallengeSection() {
  const listRef = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 60%', 'end 20%'] })
  const [active, setActive] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setActive(Math.min(steps.length - 1, Math.max(0, Math.floor(v * steps.length))))
  })

  const bandRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: bgProgress } = useScroll({ target: bandRef, offset: ['start end', 'end start'] })
  const bgY = useTransform(bgProgress, [0, 1], ['-8%', '8%'])

  return (
    <div ref={bandRef} id="challenge" className="grain relative overflow-hidden bg-espresso text-cream">
      <motion.img
        src="/images/cupper-aroma.webp"
        alt=""
        loading="lazy"
        className="photo-mono absolute inset-0 h-[116%] w-full object-cover object-[50%_30%] opacity-30"
        style={{ y: bgY }}
      />
      <div className="absolute inset-0 bg-linear-to-r from-espresso via-espresso/90 to-espresso/60" />

      <div className="wrap section-y relative z-10 grid grid-cols-[minmax(0,1fr)_5.25rem] gap-x-4 gap-y-8 sm:grid-cols-[minmax(0,1fr)_10rem] md:grid-cols-[minmax(0,1fr)_14rem] lg:grid-cols-12 lg:gap-x-8">
        <div className="col-span-2 lg:col-span-7">
          <SplitLines as="h3" className="title-section" lines={["It's not about", 'drinking coffee.']} />
          <Reveal delay={0.15}>
            <p className="title-sub mt-3 text-accent">It&rsquo;s about noticing what others miss.</p>
          </Reveal>
        </div>

        <ol ref={listRef} className="col-start-1 min-w-0 lg:col-span-7 lg:row-start-2">
          {steps.map((s, i) => {
            const on = i === active
            const past = i < active
            return (
              <li key={s.word} className="flex items-baseline gap-3 border-b border-cream/10 py-2 sm:gap-5 sm:py-2.5">
                <span className={`eyebrow w-5 shrink-0 tabular-nums transition-colors duration-500 sm:w-7 ${past || on ? 'text-accent' : 'text-cream/35'}`}>
                  0{i + 1}
                </span>
                <div className="min-w-0">
                  <p
                    className={`text-[clamp(1.25rem,3vw,2.4rem)] leading-none font-extrabold tracking-[-0.035em] uppercase transition-colors duration-500 ${
                      on ? 'text-cream' : past ? 'text-cream/40' : 'text-cream/20'
                    }`}
                  >
                    {s.word}
                  </p>
                  <motion.p
                    className="overflow-hidden text-[0.8rem] leading-snug text-cream/70 sm:text-sm"
                    initial={false}
                    animate={{ height: on ? 'auto' : 0, opacity: on ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                  >
                    <span className="block pt-1.5">{s.text}</span>
                  </motion.p>
                </div>
              </li>
            )
          })}
        </ol>

        {/* Small and sticky beside the list on phones; full size on desktop */}
        <div className="sticky top-20 col-start-2 row-start-2 self-start lg:static lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-1 lg:self-center">
          <div className="mx-auto w-full max-w-[340px]">
            <Stopwatch progress={scrollYProgress} active={active} />
          </div>
        </div>
      </div>
    </div>
  )
}

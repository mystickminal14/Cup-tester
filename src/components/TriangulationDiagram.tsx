import { AnimatePresence, motion, useInView } from 'framer-motion'
import { Shuffle } from 'lucide-react'
import { useRef, useState } from 'react'
import { EASE } from './ui'

const CUPS = [
  { x: 200, y: 92, label: 'Cup 01' },
  { x: 92, y: 282, label: 'Cup 02' },
  { x: 308, y: 282, label: 'Cup 03' },
]

/**
 * Top-down diagram of one triangulation: three cups, two the same, one different.
 * The odd cup can be reshuffled — in competition, its position is never fixed.
 */
export function TriangulationDiagram({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15% 0px' })
  const [odd, setOdd] = useState(2)
  const [round, setRound] = useState(0)

  const line = tone === 'dark' ? 'rgb(248 238 223 / 0.35)' : 'rgb(31 19 10 / 0.3)'
  const rim = tone === 'dark' ? 'rgb(248 238 223 / 0.7)' : 'rgb(31 19 10 / 0.75)'
  const same = tone === 'dark' ? '#5c3a20' : '#442917'
  const text = tone === 'dark' ? 'fill-cream' : 'fill-ink'

  const shuffle = () => {
    setOdd((prev) => {
      let next = prev
      while (next === prev) next = Math.floor(Math.random() * 3)
      return next
    })
    setRound((r) => r + 1)
  }

  return (
    <div ref={ref} className="relative">
      <svg
        viewBox="0 0 400 380"
        className="w-full"
        role="img"
        aria-label={`Triangulation diagram: three cups in a triangle. ${CUPS[odd].label} holds the different coffee; the other two are the same.`}
      >
        {/* Connecting triangle */}
        {[
          [0, 1],
          [1, 2],
          [2, 0],
        ].map(([a, b], i) => (
          <motion.line
            key={i}
            x1={CUPS[a].x}
            y1={CUPS[a].y}
            x2={CUPS[b].x}
            y2={CUPS[b].y}
            stroke={line}
            strokeWidth={1}
            strokeDasharray="2 6"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : undefined}
            transition={{ duration: 1.2, ease: EASE, delay: 0.3 + i * 0.2 }}
          />
        ))}

        {CUPS.map((c, i) => {
          const isOdd = i === odd
          return (
            <motion.g
              key={c.label}
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.9, ease: EASE, delay: 0.1 + i * 0.15 }}
            >
              {/* saucer-free cupping bowl, top-down */}
              <circle cx={c.x} cy={c.y} r={54} fill="none" stroke={rim} strokeWidth={1.25} />
              <circle cx={c.x} cy={c.y} r={47} fill="none" stroke={rim} strokeOpacity={0.25} strokeWidth={0.75} />
              <motion.circle
                key={`${c.label}-${round}`}
                cx={c.x}
                cy={c.y}
                r={42}
                initial={{ fill: same, scale: 0.85 }}
                animate={inView ? { fill: isOdd ? '#9a5f2c' : same, scale: 1 } : undefined}
                transition={{ duration: 0.8, ease: EASE, delay: round ? 0 : 1.1 + i * 0.1 }}
                style={{ transformOrigin: `${c.x}px ${c.y}px` }}
              />
              {/* crema highlight */}
              <ellipse cx={c.x - 13} cy={c.y - 14} rx={12} ry={6} fill="white" opacity={0.1} transform={`rotate(-30 ${c.x - 13} ${c.y - 14})`} />
              <text
                x={c.x}
                y={c.y + (i === 0 ? -70 : 78)}
                textAnchor="middle"
                className={`${text} text-[11px] font-semibold tracking-[0.25em] uppercase`}
              >
                {c.label}
              </text>
              <AnimatePresence mode="wait">
                {inView && (
                  <motion.text
                    key={`${round}-${isOdd}`}
                    x={c.x}
                    y={c.y + 5}
                    textAnchor="middle"
                    className="fill-cream text-[11px] font-bold tracking-[0.2em] uppercase"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, delay: round ? 0.2 : 1.6 }}
                  >
                    {isOdd ? 'Diff.' : 'Same'}
                  </motion.text>
                )}
              </AnimatePresence>
            </motion.g>
          )
        })}
      </svg>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-end gap-5">
          <p className="leading-none">
            <span className="block text-[clamp(2.25rem,4vw,3rem)] font-extrabold tracking-tighter">2</span>
            <span className="eyebrow mt-2 block opacity-70">Same</span>
          </p>
          <p className="leading-none text-accent">
            <span className="block text-[clamp(2.25rem,4vw,3rem)] font-extrabold tracking-tighter">1</span>
            <span className="eyebrow mt-2 block">Different</span>
          </p>
        </div>
        <button
          type="button"
          onClick={shuffle}
          className="group eyebrow inline-flex items-center gap-2 rounded-[3px] border border-current/25 px-3 py-2.5 transition-colors hover:border-accent hover:text-accent"
        >
          <Shuffle size={14} className="transition-transform duration-500 group-hover:rotate-180" />
          Shuffle
        </button>
      </div>
    </div>
  )
}

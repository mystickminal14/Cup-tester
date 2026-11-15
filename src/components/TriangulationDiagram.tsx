import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { Deco, EASE } from './ui'

const randomOdd = (not?: number) => {
  let n = Math.floor(Math.random() * 3)
  while (n === not) n = Math.floor(Math.random() * 3)
  return n
}

/** Side-on cupping bowl. The odd cup holds a lighter roast. */
export function Bowl({ odd, revealed, picked, n }: { odd: boolean; revealed: boolean; picked: boolean; n: number }) {
  const coffee = revealed && odd ? '#b8742f' : '#3b1d0b'
  return (
    <svg viewBox="0 0 120 112" className="w-full overflow-visible" aria-hidden="true">
      {/* steam */}
      {[42, 60, 78].map((x, i) => (
        <motion.path
          key={x}
          d={`M${x} 30c-6-7 6-11 0-18`}
          fill="none"
          stroke="white"
          strokeWidth={3}
          strokeLinecap="round"
          animate={{ opacity: [0, 0.8, 0], y: [4, -6, -12] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.5 + n * 0.3, ease: 'easeInOut' }}
        />
      ))}
      {/* bowl */}
      <path d="M12 44h96c0 30-18 52-48 52S12 74 12 44z" fill="var(--color-cream)" stroke="var(--color-navy)" strokeWidth={4} />
      <ellipse cx={60} cy={44} rx={48} ry={11} fill="var(--color-cream)" stroke="var(--color-navy)" strokeWidth={4} />
      <motion.ellipse cx={60} cy={45} rx={41} ry={7.5} animate={{ fill: coffee }} transition={{ duration: 0.6 }} />
      <ellipse cx={46} cy={43} rx={10} ry={2.5} fill="white" opacity={0.25} />
      <rect x={36} y={96} width={48} height={8} rx={4} fill="var(--color-navy)" />
      <text x={60} y={78} textAnchor="middle" className="headline fill-navy text-[22px]">
        {n + 1}
      </text>
      {picked && (
        <motion.circle
          cx={60}
          cy={62}
          r={58}
          fill="none"
          stroke={odd ? 'var(--color-yellow)' : 'var(--color-red)'}
          strokeWidth={4}
          strokeDasharray="8 7"
          initial={{ pathLength: 0, rotate: -90 }}
          animate={{ pathLength: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        />
      )}
    </svg>
  )
}

/**
 * A playable triangulation: three cups, one different. Pick the odd one out,
 * then pour a new round. In competition its position is never fixed.
 */
export function TriangulationDiagram() {
  const [odd, setOdd] = useState(() => randomOdd())
  const [pick, setPick] = useState<number | null>(null)
  const [score, setScore] = useState({ right: 0, rounds: 0 })

  const choose = (i: number) => {
    if (pick !== null) return
    setPick(i)
    setScore((s) => ({ right: s.right + (i === odd ? 1 : 0), rounds: s.rounds + 1 }))
  }
  const next = () => {
    setOdd((o) => randomOdd(o))
    setPick(null)
  }

  const verdict = pick === null ? null : pick === odd ? 'right' : 'wrong'

  return (
    <div className="waves sticker relative overflow-hidden rounded-[2rem] bg-blue p-5 text-white sm:p-7">
      <Deco kind="leaf" className="-right-6 -bottom-6 w-24 rotate-180 opacity-90" float={false} />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="headline inline-block -rotate-2 bg-yellow px-3 py-1 text-[1rem] text-navy">Play a round</p>
          <p className="mt-3 text-[0.95rem] font-semibold text-white/85">Two cups match. Which one is the odd cup out?</p>
        </div>
        <p className="shrink-0 rounded-2xl bg-white/10 px-3 py-2 text-center" aria-live="polite">
          <span className="headline block text-[1.6rem] leading-none text-yellow tabular-nums">
            {score.right}/{score.rounds}
          </span>
          <span className="text-[0.6rem] font-extrabold tracking-[0.14em] uppercase">Score</span>
        </p>
      </div>

      <div className="relative mt-8 rounded-[1.5rem] bg-blue-deep/60 px-3 pt-6 pb-4 ring-2 ring-white/10 sm:px-5">
        <ul className="grid grid-cols-3 gap-3 sm:gap-5">
          {[0, 1, 2].map((i) => (
            <li key={i}>
              <motion.button
                type="button"
                onClick={() => choose(i)}
                disabled={pick !== null}
                aria-label={`Cup ${i + 1}`}
                className="block w-full rounded-2xl p-1 disabled:cursor-default"
                whileHover={pick === null ? { y: -8, rotate: i === 1 ? 0 : i === 0 ? -3 : 3 } : undefined}
                whileTap={pick === null ? { scale: 0.94 } : undefined}
                animate={verdict && i === odd ? { y: [0, -14, 0] } : { y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <Bowl n={i} odd={i === odd} revealed={pick !== null} picked={pick === i} />
              </motion.button>
            </li>
          ))}
        </ul>
        {/* table edge */}
        <div className="mt-2 h-2 rounded-full bg-white/15" />
      </div>

      <div className="mt-5 flex min-h-12 flex-wrap items-center justify-between gap-3">
        <AnimatePresence mode="wait">
          <motion.p
            key={verdict ?? 'idle'}
            className={`headline text-[clamp(1.6rem,4vw,2.1rem)] leading-tight ${verdict === 'wrong' ? 'text-red' : 'text-yellow'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {verdict === 'right' && 'Spot on! Champion palate.'}
            {verdict === 'wrong' && `Not quite. It was cup ${odd + 1}.`}
            {!verdict && (
              /* zooms in and out, letters hop in a wave, arrow points at the cups */
              <span className="cta-zoom" aria-label="Tap a cup to taste">
                <span aria-hidden="true">
                  {'Tap a cup to taste'.split('').map((ch, i) => (
                    <span key={i} className="cta-wave" style={{ animationDelay: `${i * 0.05}s` }}>
                      {ch === ' ' ? '\u00a0' : ch}
                    </span>
                  ))}
                </span>
                <span aria-hidden="true" className="cta-point ml-2 text-red">
                  ↑
                </span>
              </span>
            )}
          </motion.p>
        </AnimatePresence>
        {pick !== null && (
          <button type="button" onClick={next} className="btn group bg-yellow py-2.5 text-navy hover:bg-white">
            <RotateCcw size={15} className="transition-transform duration-500 group-hover:-rotate-180" />
            Pour new cups
          </button>
        )}
      </div>
    </div>
  )
}

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Plus } from 'lucide-react'
import { useId, useState } from 'react'
import { rules } from '../data/event'
import { EASE } from './ui'

export function Rules() {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <div className="border-y border-ink/20">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={panelId}
          className="group flex w-full items-center justify-between gap-4 py-4 text-left md:py-5"
        >
          <span className="title-sub transition-colors group-hover:text-accent-deep">Rules &amp; regulations</span>
          <motion.span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/30"
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <Plus size={16} strokeWidth={1.75} />
          </motion.span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="grid gap-6 pb-6 md:grid-cols-2 md:gap-10">
              <div>
                <p className="text-base leading-snug font-medium">{rules.summary}</p>
                {rules.pdfUrl ? (
                  <a
                    href={rules.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group mt-5 inline-flex items-center gap-4 rounded-[3px] bg-espresso px-5 py-3 text-[0.7rem] font-semibold tracking-[0.18em] text-cream uppercase transition-colors hover:bg-accent"
                  >
                    View rules <span className="transition-transform group-hover:translate-x-1">→</span>
                  </a>
                ) : (
                  <span
                    aria-disabled="true"
                    className="mt-5 inline-flex cursor-not-allowed flex-wrap items-center gap-x-4 gap-y-1 rounded-[3px] border border-ink/25 px-5 py-3 text-[0.7rem] font-semibold tracking-[0.18em] text-ink/50 uppercase"
                  >
                    View rules → <span className="text-accent-deep">Coming soon</span>
                  </span>
                )}
              </div>
              <div>
                <p className="eyebrow text-ink/55">Previous editions, for reference</p>
                <ul className="mt-2">
                  {rules.previous.map((r) => (
                    <li key={r.href} className="border-b border-ink/15">
                      <a
                        href={r.href}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between gap-4 py-2.5 text-sm font-medium hover:text-accent-deep"
                      >
                        {r.label} <ArrowUpRight size={14} className="shrink-0" />
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-ink/55">Previous rules may differ from this year&rsquo;s.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

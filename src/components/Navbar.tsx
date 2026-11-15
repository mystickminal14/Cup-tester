import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { pastEventsUrl, rules } from '../data/event'
import { CupTastersLogo, EASE, Burst } from './ui'

const links = [
  { label: 'About the Competition', href: '#how-it-works' },
  /* Opens the official 2026 rules PDF (falls back to the 2024 rules if it's ever removed). */
  { label: 'Rules & Regulations', href: rules.pdfUrl ?? rules.previous[0].href, external: true },
  { label: 'Past Events', href: pastEventsUrl, external: true },
  { label: 'Sponsors', href: '#sponsors' },
]

export function Navbar() {
  const { scrollY } = useScroll()
  const [solid, setSolid] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setSolid(y > 40)
    setHidden(y > 600 && y > prev && !open)
  })

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50 px-2 pt-2 sm:px-4 sm:pt-3"
        animate={{ y: hidden ? '-120%' : '0%' }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <nav
          className={`mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-3 rounded-full pr-2 pl-5 text-white md:pl-7 transition-[background-color,box-shadow] duration-500 md:h-20 ${
            solid ? 'bg-blue-deep/95 shadow-[0_10px_30px_-12px_rgb(46_8_32/0.6)] backdrop-blur' : 'bg-transparent'
          }`}
        >
          <a href="#top" className="flex min-w-0 items-center gap-2.5" aria-label="The Barista's Coffee School · Cup Tasters Championship, back to top">
            <CupTastersLogo className="h-11 md:h-14" />
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  {...(l.external && { target: '_blank', rel: 'noreferrer' })}
                  className="rounded-full px-3 py-2 text-[0.8rem] font-bold tracking-[0.06em] whitespace-nowrap uppercase xl:px-4 xl:text-[0.92rem] transition-colors hover:bg-white/10 hover:text-yellow"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1.5">
            <a href="#register" className="btn hidden bg-yellow px-5 py-2.5 text-navy hover:bg-white sm:inline-flex md:py-3">
              Register now
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 lg:hidden"
              aria-label="Open menu"
              aria-expanded={open}
            >
              <Menu size={22} strokeWidth={2} />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="waves fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-blue px-[clamp(1rem,4vw,2.5rem)] pt-4 pb-8 text-white"
            initial={{ clipPath: 'circle(0% at 100% 0%)' }}
            animate={{ clipPath: 'circle(150% at 100% 0%)' }}
            exit={{ clipPath: 'circle(0% at 100% 0%)' }}
            transition={{ duration: 0.7, ease: EASE }}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2.5">
                <CupTastersLogo className="h-16" />
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10"
                aria-label="Close menu"
              >
                <X size={24} strokeWidth={2} />
              </button>
            </div>
            <ul className="mt-auto pt-10">
              {[...links, { label: 'Register', href: '#register' }].map((l, i) => (
                <li key={l.href} className="overflow-hidden">
                  <motion.a
                    href={l.href}
                    {...('external' in l && l.external && { target: '_blank', rel: 'noreferrer' })}
                    onClick={() => setOpen(false)}
                    className="headline flex items-center gap-4 py-2.5 text-[clamp(2rem,9vw,3rem)] hover:text-yellow"
                    initial={{ y: '100%' }}
                    animate={{ y: '0%' }}
                    transition={{ duration: 0.7, ease: EASE, delay: 0.2 + i * 0.06 }}
                  >
                    <Burst className="h-5 w-5 shrink-0" color={i % 2 ? 'var(--color-sky)' : 'var(--color-red)'} />
                    {l.label}
                  </motion.a>
                </li>
              ))}
            </ul>
            <a
              href="#register"
              onClick={() => setOpen(false)}
              className="btn mt-8 w-full justify-between bg-yellow py-4 text-navy"
            >
              Register to compete <span>→</span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

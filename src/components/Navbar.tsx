import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { BrandLogo, EASE } from './ui'

const links = [
  { label: 'The Challenge', href: '#about' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Champions', href: '#champions' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Register', href: '#register' },
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
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          solid ? 'bg-espresso/95 border-b border-cream/10' : 'bg-transparent'
        }`}
        animate={{ y: hidden ? '-100%' : '0%' }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <nav className="wrap flex h-16 items-center justify-between gap-3 text-cream md:h-[4.5rem]">
          <a href="#top" className="flex min-w-0 items-center gap-2.5 sm:gap-3" aria-label="Cup Tasters Championship, back to top">
            <BrandLogo size={40} className="md:h-11 md:w-11" />
            <span className="text-[0.65rem] leading-tight font-bold tracking-[0.2em] uppercase sm:text-xs">
              Barista&rsquo;s
              <br className="sm:hidden" /> Coffee School
            </span>
          </a>

          <ul className="hidden items-center gap-7 xl:gap-9 lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="group relative text-[0.7rem] font-medium tracking-[0.22em] uppercase opacity-80 transition-opacity hover:opacity-100"
                >
                  {l.label}
                  <span className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-500 ease-(--ease-editorial) group-hover:scale-x-100" />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <a
              href="#register"
              className="group hidden items-center gap-2 border border-cream/40 px-4 py-2.5 text-[0.7rem] font-semibold tracking-[0.2em] uppercase transition-colors hover:border-accent hover:bg-accent sm:inline-flex"
            >
              Apply now
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="p-2 lg:hidden"
              aria-label="Open menu"
              aria-expanded={open}
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="grain fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-espresso px-[clamp(1rem,4vw,2.5rem)] pt-4 pb-8 text-cream"
            initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            transition={{ duration: 0.7, ease: EASE }}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="relative z-10 flex items-center justify-between">
              <span className="flex items-center gap-3 text-[0.65rem] font-bold tracking-[0.2em] uppercase">
                <BrandLogo size={36} /> Cup Tasters · Nepal
              </span>
              <button type="button" onClick={() => setOpen(false)} className="p-2" aria-label="Close menu">
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>
            <ul className="relative z-10 mt-auto pt-10">
              {links.map((l, i) => (
                <li key={l.href} className="overflow-hidden border-b border-cream/10">
                  <motion.a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-3 py-3.5 text-[clamp(1.6rem,8vw,2.6rem)] leading-none font-extrabold tracking-tight uppercase"
                    initial={{ y: '100%' }}
                    animate={{ y: '0%' }}
                    transition={{ duration: 0.7, ease: EASE, delay: 0.25 + i * 0.06 }}
                  >
                    <span className="text-xs font-medium tracking-widest text-accent">0{i + 1}</span>
                    {l.label}
                  </motion.a>
                </li>
              ))}
            </ul>
            <a
              href="#register"
              onClick={() => setOpen(false)}
              className="relative z-10 mt-8 flex items-center justify-between rounded-[3px] bg-accent px-5 py-4 text-xs font-semibold tracking-[0.2em] uppercase"
            >
              Apply now <span>→</span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

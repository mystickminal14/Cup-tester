import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { gallery, galleryNote } from '../data/event'
import { Organizer } from './Organizer'
import { EASE, SectionLabel, SplitLines } from './ui'

function Lightbox({ index, onClose, onStep }: { index: number; onClose: () => void; onStep: (d: number) => void }) {
  const item = gallery[index]
  const closeRef = useRef<HTMLButtonElement>(null)
  const touchX = useRef<number | null>(null)

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onStep(1)
      if (e.key === 'ArrowLeft') onStep(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prev?.focus()
    }
  }, [onClose, onStep])

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex flex-col bg-ink/95 text-cream"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      onClick={onClose}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 50) onStep(dx < 0 ? 1 : -1)
        touchX.current = null
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 md:px-10">
        <span className="eyebrow text-cream/60 tabular-nums">
          {String(index + 1).padStart(2, '0')} / {String(gallery.length).padStart(2, '0')}
        </span>
        <button ref={closeRef} type="button" onClick={onClose} className="p-2" aria-label="Close">
          <X size={26} strokeWidth={1.5} />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-24">
        <AnimatePresence mode="wait">
          <motion.img
            key={item.src}
            src={item.src}
            alt={item.alt}
            className="max-h-full max-w-full object-contain"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.45, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
          />
        </AnimatePresence>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onStep(-1)
          }}
          className="absolute left-2 hidden p-3 text-cream/70 hover:text-cream md:left-6 md:block"
          aria-label="Previous photo"
        >
          <ChevronLeft size={34} strokeWidth={1.25} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onStep(1)
          }}
          className="absolute right-2 hidden p-3 text-cream/70 hover:text-cream md:right-6 md:block"
          aria-label="Next photo"
        >
          <ChevronRight size={34} strokeWidth={1.25} />
        </button>
      </div>

      <div
        className="flex flex-col gap-1 px-4 py-4 md:flex-row md:items-baseline md:justify-between md:px-10"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-base font-medium">{item.caption}</p>
        <p className="eyebrow text-cream/50">
          {item.source === 'reference' ? 'Reference · ' : ''}Photo: {item.credit}
        </p>
      </div>
    </motion.div>
  )
}

export function Gallery() {
  const [open, setOpen] = useState<number | null>(null)
  const close = useCallback(() => setOpen(null), [])
  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + gallery.length) % gallery.length)),
    [],
  )

  return (
    <section id="gallery" className="relative bg-cream">
      <div className="wrap section-y">
        <div className="grid gap-5 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <SectionLabel index="05">Gallery</SectionLabel>
            <SplitLines className="title-section mt-5" lines={['From the', 'cupping table.']} />
          </div>
          <p className="text-sm leading-relaxed text-ink/65 md:col-span-4 md:col-start-9">{galleryNote}</p>
        </div>

        <ul className="mt-8 grid auto-rows-[38vw] grid-cols-2 gap-2 sm:auto-rows-[30vw] md:mt-12 md:auto-rows-[clamp(64px,6.4vw,92px)] md:grid-cols-12 md:gap-3">
          {gallery.map((g, i) => (
            <motion.li
              key={g.src}
              className={`${g.span} ${i % 3 === 0 ? 'col-span-2' : ''} relative min-w-0`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-5% 0px' }}
              transition={{ duration: 0.8, ease: EASE, delay: (i % 3) * 0.06 }}
            >
              <button
                type="button"
                onClick={() => setOpen(i)}
                className="group relative block h-full w-full overflow-hidden rounded-[2px] bg-roast text-left"
                aria-label={`Open photo: ${g.caption}`}
              >
                <img
                  src={g.src}
                  alt={g.alt}
                  loading="lazy"
                  decoding="async"
                  className={`h-full w-full object-cover transition-all duration-[1.2s] ease-(--ease-editorial) group-hover:scale-[1.05] ${
                    g.source === 'event' ? 'photo-warm' : 'photo-mono group-hover:filter-none'
                  }`}
                />
                <span className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="pointer-events-none absolute inset-x-0 bottom-0 hidden translate-y-2 items-end justify-between gap-3 p-3 md:flex text-cream opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="text-sm font-medium">{g.caption}</span>
                  <span className="eyebrow shrink-0">View ↗</span>
                </span>
                {g.source === 'event' && (
                  <span className="eyebrow absolute top-2 left-2 rounded-[2px] bg-espresso/85 px-2 py-1 text-[0.55rem] text-cream">
                    BCS event
                  </span>
                )}
              </button>
            </motion.li>
          ))}
        </ul>

        <div className="mt-14 md:mt-20">
          <Organizer />
        </div>
      </div>

      <AnimatePresence>
        {open !== null && <Lightbox index={open} onClose={close} onStep={step} />}
      </AnimatePresence>
    </section>
  )
}

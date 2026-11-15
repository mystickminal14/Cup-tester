import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { gallery, galleryNote } from '../data/event'
import { EASE, SectionLabel, SplitLines } from './ui'

function Lightbox({
  index,
  onClose,
  onStep,
  onJump,
}: {
  index: number
  onClose: () => void
  onStep: (d: number) => void
  onJump: (i: number) => void
}) {
  const item = gallery[index]
  const closeRef = useRef<HTMLButtonElement>(null)
  const thumbsRef = useRef<HTMLUListElement>(null)
  const [dir, setDir] = useState(1)

  const go = useCallback(
    (d: number) => {
      setDir(d)
      onStep(d)
    },
    [onStep],
  )

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prev?.focus()
    }
  }, [onClose, go])

  // Keep the active thumbnail in view.
  useEffect(() => {
    thumbsRef.current
      ?.querySelector<HTMLElement>(`[data-i="${index}"]`)
      ?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [index])

  // Preload neighbours so stepping feels instant.
  useEffect(() => {
    ;[1, -1].forEach((d) => {
      const img = new Image()
      img.src = gallery[(index + d + gallery.length) % gallery.length].src
    })
  }, [index])

  const navBtn =
    'absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/20 backdrop-blur-md transition hover:bg-yellow hover:text-navy md:h-14 md:w-14'

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex flex-col overflow-hidden bg-navy text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
    >
      {/* the current photo, blurred, as a soft backdrop */}
      <AnimatePresence initial={false}>
        <motion.img
          key={item.src}
          src={item.src}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover opacity-40 blur-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      </AnimatePresence>
      <div className="pointer-events-none absolute inset-0 bg-navy/55" />

      {/* top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 md:px-8 md:py-4">
        <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold tabular-nums ring-1 ring-white/15 backdrop-blur-md">
          <span className="text-yellow">{String(index + 1).padStart(2, '0')}</span> / {String(gallery.length).padStart(2, '0')}
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur-md transition hover:bg-yellow hover:text-navy"
          aria-label="Close"
        >
          <X size={22} strokeWidth={2} />
        </button>
      </div>

      {/* stage */}
      <div className="relative z-0 flex min-h-0 flex-1 items-center justify-center px-3 md:px-24" onClick={onClose}>
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.figure
            key={item.src}
            custom={dir}
            className="flex h-full max-h-full w-full items-center justify-center"
            initial={{ opacity: 0, x: dir * 80, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: dir * -80, scale: 0.96 }}
            transition={{ duration: 0.45, ease: EASE }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) go(1)
              else if (info.offset.x > 60) go(-1)
            }}
          >
            <img
              src={item.src}
              alt={item.alt}
              draggable={false}
              onClick={(e) => e.stopPropagation()}
              className="max-h-full max-w-full rounded-2xl object-contain shadow-[0_30px_80px_-20px_rgb(0_0_0/0.7)] ring-1 ring-white/10 select-none"
            />
          </motion.figure>
        </AnimatePresence>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            go(-1)
          }}
          className={`${navBtn} left-2 md:left-6`}
          aria-label="Previous photo"
        >
          <ChevronLeft size={28} strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            go(1)
          }}
          className={`${navBtn} right-2 md:right-6`}
          aria-label="Next photo"
        >
          <ChevronRight size={28} strokeWidth={1.75} />
        </button>
      </div>

      {/* caption + thumbnails */}
      <div className="relative z-10 px-4 pt-3 pb-4 md:px-8 md:pb-6">
        <div className="mb-3 flex flex-col gap-0.5 text-center md:flex-row md:items-baseline md:justify-between md:text-left">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={item.caption}
              className="text-base font-bold md:text-lg"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              {item.caption}
            </motion.p>
          </AnimatePresence>
          <p className="eyebrow text-white/55">Photo: {item.credit}</p>
        </div>
        <ul ref={thumbsRef} className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" aria-label="All photos">
          {gallery.map((g, i) => (
            <li key={g.src} className="shrink-0">
              <button
                type="button"
                data-i={i}
                onClick={() => {
                  setDir(i > index ? 1 : -1)
                  onJump(i)
                }}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index}
                className={`block h-12 w-[4.5rem] overflow-hidden rounded-lg transition md:h-14 md:w-20 ${
                  i === index ? 'opacity-100 ring-2 ring-yellow' : 'opacity-45 hover:opacity-90'
                }`}
              >
                <img src={g.src} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

/**
 * Bento of 6 tiles where every tile is exactly 16:9, the shape of the photos,
 * so nothing gets cropped. Two big tiles, four small, staggered:
 *   Desktop (4 cols × 3 rows):  [A A b c] [A A B B] [d e B B]
 *   Phone   (2 cols × 6 rows):  [A A] [A A] [b c] [B B] [B B] [d e]
 */
const TILES = [
  'col-span-2 row-span-2 md:col-start-1 md:row-start-1', // A
  'md:col-start-3 md:row-start-1', // b
  'md:col-start-4 md:row-start-1', // c
  'col-span-2 row-span-2 md:col-start-3 md:row-start-2', // B
  'md:col-start-1 md:row-start-3', // d
  'md:col-start-2 md:row-start-3', // e
]
const SWAP_MS = 2200
/** Order the tiles change in, so swaps hop around the grid. */
const SWAP_ORDER = [0, 4, 2, 3, 5, 1]

/** Landscape photos fill the 16:9 tiles exactly; portrait ones stay in the viewer only. */
const pool = gallery
  .map((g, index) => ({ g, index }))
  .filter(({ g }) => g.orientation !== 'portrait')

export function Gallery() {
  const [open, setOpen] = useState<number | null>(null)
  const [slots, setSlots] = useState(() => pool.slice(0, TILES.length).map((_, i) => i))
  const next = useRef(TILES.length % pool.length)
  const tick = useRef(0)
  const live = useRef(true)

  useEffect(() => {
    if (open !== null || pool.length <= TILES.length) return
    const onVis = () => (live.current = !document.hidden)
    document.addEventListener('visibilitychange', onVis)
    const t = setInterval(() => {
      if (!live.current) return
      setSlots((cur) => {
        let n = next.current
        while (cur.includes(n)) n = (n + 1) % pool.length
        next.current = (n + 1) % pool.length
        const slot = SWAP_ORDER[tick.current++ % SWAP_ORDER.length]
        return cur.map((v, i) => (i === slot ? n : v))
      })
    }, SWAP_MS)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [open])

  // Warm the cache for the photo that comes in next.
  useEffect(() => {
    const img = new Image()
    img.src = pool[next.current].g.src
  }, [slots])

  const close = useCallback(() => setOpen(null), [])
  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + gallery.length) % gallery.length)),
    [],
  )

  return (
    <section id="gallery" className="waves relative overflow-hidden bg-navy text-white">
      <div className="wrap section-y">
        <div className="grid gap-5 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <SectionLabel index="06" className="text-yellow">
              Gallery
            </SectionLabel>
            <SplitLines
              className="title-section mt-6"
              lines={['From the', <span key="c" className="text-yellow">cupping table.</span>]}
            />
          </div>
          <div className="md:col-span-4 md:col-start-9">
            <p className="text-sm leading-relaxed font-medium text-white/75">{galleryNote}</p>
          </div>
        </div>

        {/* grid box has the exact ratio of its 16:9 cells (gaps aside) */}
        <ul
          className="mt-8 grid aspect-[16/27] grid-cols-2 grid-rows-6 gap-2 sm:gap-3 md:mt-[min(3rem,5svh)] md:aspect-[64/27] md:grid-cols-4 md:grid-rows-3"
          aria-label="Photos"
        >
          {TILES.map((place, slot) => {
            const item = pool[slots[slot]]
            return (
              <li key={slot} className={`relative min-h-0 overflow-hidden rounded-2xl bg-white/5 ${place}`}>
                <AnimatePresence initial={false}>
                  <motion.button
                    key={item.g.src}
                    type="button"
                    onClick={() => setOpen(item.index)}
                    aria-label={`Open photo: ${item.g.caption}`}
                    className="group absolute inset-0 block overflow-hidden rounded-2xl ring-2 ring-transparent ring-inset hover:ring-yellow focus-visible:ring-yellow"
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.1, ease: EASE }}
                  >
                    <img
                      src={item.g.src}
                      alt={item.g.alt}
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-navy/85 to-transparent p-3 text-left text-xs font-bold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:text-sm">
                      {item.g.caption}
                    </span>
                  </motion.button>
                </AnimatePresence>
              </li>
            )
          })}
        </ul>

        <div className="mt-6 flex justify-center">
          <button type="button" onClick={() => setOpen(0)} className="btn bg-yellow text-navy hover:bg-white">
            View all {gallery.length} photos
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open !== null && <Lightbox index={open} onClose={close} onStep={step} onJump={setOpen} />}
      </AnimatePresence>
    </section>
  )
}

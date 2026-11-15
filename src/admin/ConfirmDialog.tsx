import { AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

export type ConfirmTone = 'danger' | 'success' | 'warning' | 'neutral'

export interface ConfirmOptions {
  title: string
  message: ReactNode
  confirmLabel: string
  tone?: ConfirmTone
}

const toneStyles: Record<ConfirmTone, { icon: ReactNode; iconBox: string; button: string }> = {
  danger: {
    icon: <AlertTriangle size={20} />,
    iconBox: 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400',
    button: 'bg-red-600 text-white hover:bg-red-700',
  },
  success: {
    icon: <CheckCircle2 size={20} />,
    iconBox: 'bg-green-50 text-green-600 dark:bg-green-950/60 dark:text-green-400',
    button: 'bg-green-600 text-white hover:bg-green-700',
  },
  warning: {
    icon: <RotateCcw size={20} />,
    iconBox: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    button: 'bg-amber-500 text-white hover:bg-amber-600',
  },
  neutral: {
    icon: <CheckCircle2 size={20} />,
    iconBox: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200',
    button: 'bg-zinc-900 text-white hover:opacity-90 dark:bg-zinc-50 dark:text-zinc-900',
  },
}

/**
 * Promise-based confirm dialog for admin actions.
 *   const [confirm, dialog] = useConfirm()
 *   if (!(await confirm({ title, message, confirmLabel, tone: 'danger' }))) return
 *   …render {dialog} somewhere in the component.
 */
export function useConfirm() {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null)
  const resolver = useRef<((ok: boolean) => void) | null>(null)

  const confirm = useCallback(
    (o: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        resolver.current = resolve
        setOpts(o)
      }),
    [],
  )

  const finish = useCallback((ok: boolean) => {
    resolver.current?.(ok)
    resolver.current = null
    setOpts(null)
  }, [])

  const dialog = opts ? <ConfirmDialog {...opts} onDone={finish} /> : null
  return [confirm, dialog] as const
}

function ConfirmDialog({ title, message, confirmLabel, tone = 'neutral', onDone }: ConfirmOptions & { onDone: (ok: boolean) => void }) {
  const okRef = useRef<HTMLButtonElement>(null)
  const t = toneStyles[tone]

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    okRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onDone(false)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      prev?.focus()
    }
  }, [onDone])

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-[2px]"
      onClick={() => onDone(false)}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="w-full max-w-[420px] rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-3.5">
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${t.iconBox}`}>{t.icon}</span>
          <div className="min-w-0 pt-0.5">
            <h2 id="confirm-title" className="text-[16px] font-semibold tracking-tight">
              {title}
            </h2>
            <div id="confirm-message" className="mt-1.5 leading-relaxed text-zinc-600 dark:text-zinc-400">
              {message}
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn px-4 py-2" onClick={() => onDone(false)}>
            Cancel
          </button>
          <button
            ref={okRef}
            type="button"
            className={`inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition active:scale-[0.97] ${t.button}`}
            onClick={() => onDone(true)}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

import { useSyncExternalStore, type MouseEvent } from 'react'

/** Minimal history router for the two admin screens. */
const subscribe = (cb: () => void) => {
  window.addEventListener('popstate', cb)
  return () => window.removeEventListener('popstate', cb)
}

export function useLocation() {
  return useSyncExternalStore(subscribe, () => window.location.pathname + window.location.search)
}

export function navigate(to: string) {
  if (to === window.location.pathname + window.location.search) return
  window.history.pushState(null, '', to)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

/** onClick for <a href> that keeps cmd/ctrl-click opening a new tab. */
export function linkClick(e: MouseEvent<HTMLAnchorElement>) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
  e.preventDefault()
  navigate(e.currentTarget.getAttribute('href')!)
}

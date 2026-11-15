import { Handshake, Loader2, LogOut, Menu, Users, X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { api, setUnauthorizedHandler, type User } from './api'
import { Login } from './Login'
import { ParticipantDetail } from './ParticipantDetail'
import { Participants } from './Participants'
import { SponsorInquiries } from './SponsorInquiries'
import { linkClick, useLocation } from './router'
import './admin.css'

/**
 * /admin — superadmin dashboard. Same look as the AdsMitra dashboard:
 * Inter, zinc neutrals, white sidebar with a solid black active pill.
 */
export default function AdminApp() {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [bootError, setBootError] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Admin · Cup Tasters Championship'
    const meta = Object.assign(document.createElement('meta'), { name: 'robots', content: 'noindex' })
    const font = Object.assign(document.createElement('link'), {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    })
    document.head.append(meta, font)
    setUnauthorizedHandler(() => setUser(null))
    api
      .session()
      .then((s) => setUser(s.user))
      .catch((e: Error) => setBootError(e.message))
    return () => {
      meta.remove()
      font.remove()
    }
  }, [])

  return (
    <div className="min-h-screen bg-zinc-100 font-[Inter,system-ui,sans-serif] text-[14px] text-zinc-950 antialiased dark:bg-zinc-950 dark:text-zinc-50">
      {bootError ? (
        <Centered>
          <p className="max-w-sm text-center text-red-600 dark:text-red-400">{bootError}</p>
        </Centered>
      ) : user === undefined ? (
        <Centered>
          <Loader2 className="animate-spin text-zinc-400" />
        </Centered>
      ) : user === null ? (
        <Login onLogin={setUser} />
      ) : (
        <Shell user={user} onLogout={() => setUser(null)} />
      )}
    </div>
  )
}

function Centered({ children }: { children: ReactNode }) {
  return <div className="grid min-h-screen place-items-center p-4">{children}</div>
}

/** Cup Tasters logo (yellow + white) on the event's deep-blue tile, plus BCS roundel. */
export function BrandMark({ large = false }: { large?: boolean }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl bg-[#16237e] ${large ? 'px-4 py-3.5' : 'px-3 py-2.5'}`}>
      <img src="/bcs-logo.png" alt="The Barista's Coffee School" className={`${large ? 'h-11 w-11' : 'h-9 w-9'} shrink-0 rounded-full bg-white p-0.5`} />
      <span className="h-8 w-px shrink-0 bg-white/25" aria-hidden="true" />
      <img src="/images/cup-tasters-logo.webp" alt="Cup Tasters Championship" className={`${large ? 'h-12' : 'h-10'} w-auto min-w-0`} />
      <span className="ml-auto self-start rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-white/90 uppercase">
        Admin
      </span>
    </div>
  )
}

function Shell({ user, onLogout }: { user: User; onLogout: () => void }) {
  const location = useLocation()
  const [navOpen, setNavOpen] = useState(false)
  const detail = location.match(/^\/admin\/participants\/(\d+)/)
  const sponsorsPage = location.startsWith('/admin/sponsors')

  const logout = async () => {
    await api.logout().catch(() => {})
    onLogout()
  }

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-[264px] flex-col border-r border-zinc-200 bg-white px-3 py-4 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-x-0 dark:border-zinc-800 dark:bg-zinc-900 ${
          navOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2 pb-5">
          <div className="min-w-0 flex-1">
            <BrandMark />
          </div>
          <button onClick={() => setNavOpen(false)} className="icon-btn lg:hidden" aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
        <p className="mb-1.5 px-2 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">Manage</p>
        {[
          { href: '/admin', label: 'Participants', icon: <Users size={18} />, on: !sponsorsPage },
          { href: '/admin/sponsors', label: 'Sponsor enquiries', icon: <Handshake size={18} />, on: sponsorsPage },
        ].map((l) => (
          <a
            key={l.href}
            href={l.href}
            onClick={(e) => {
              linkClick(e)
              setNavOpen(false)
            }}
            className={`mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium ${
              l.on
                ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
            }`}
          >
            {l.icon} {l.label}
          </a>
        ))}

        <div className="mt-auto flex items-center gap-2.5 border-t border-zinc-200 px-2 pt-3 dark:border-zinc-800">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-zinc-100 font-semibold dark:bg-zinc-800">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <strong className="block truncate font-semibold">{user.name}</strong>
            <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">
              {user.role === 'superadmin' ? 'Superadmin' : 'Admin'} · {user.email ?? `@${user.username}`}
            </span>
          </span>
          <button onClick={logout} className="icon-btn" title="Sign out" aria-label="Sign out">
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      {navOpen && <div className="fixed inset-0 z-20 bg-black/35 lg:hidden" onClick={() => setNavOpen(false)} />}

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-10 flex h-[60px] items-center gap-3 border-b border-zinc-200 bg-zinc-100/85 px-4 backdrop-blur sm:px-7 dark:border-zinc-800 dark:bg-zinc-950/85">
          <button onClick={() => setNavOpen(true)} className="icon-btn lg:hidden" aria-label="Open menu">
            <Menu size={20} />
          </button>
          <h1 className="text-[17px] font-semibold tracking-tight">{sponsorsPage ? 'Sponsor enquiries' : detail ? 'Participant' : 'Participants'}</h1>
        </header>
        <main className="w-full px-4 pt-4 pb-12 sm:px-7 sm:pt-6">
          {sponsorsPage ? (
            <SponsorInquiries canDelete={user.role === 'superadmin'} />
          ) : detail ? (
            <ParticipantDetail id={Number(detail[1])} canDelete={user.role === 'superadmin'} />
          ) : (
            <Participants canDelete={user.role === 'superadmin'} />
          )}
        </main>
      </div>
    </>
  )
}

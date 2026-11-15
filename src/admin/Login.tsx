import { Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { BrandMark } from './AdminApp'
import { api, type User } from './api'

export function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await api.login(email, password)
      onLogin(res.user)
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <main className="w-full max-w-[400px] rounded-2xl border border-zinc-200 bg-white px-7 py-8 dark:border-zinc-800 dark:bg-zinc-900">
        <BrandMark large />
        <h1 className="mt-7 text-[22px] font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">Superadmin access only.</p>

        {error && (
          <div role="alert" className="mt-5 rounded-lg bg-red-50 px-3.5 py-2.5 font-medium text-red-600 dark:bg-red-950/60 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="mt-5 flex flex-col gap-3.5">
          <label className="field">
            Username or email
            <input
              type="text"
              autoCapitalize="none"
              spellCheck={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="username"
              className="input"
            />
          </label>
          <label className="field">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="input"
            />
          </label>
          <button type="submit" disabled={busy} className="btn-primary mt-1 w-full">
            {busy && <Loader2 size={16} className="animate-spin" />}
            Sign in
          </button>
        </form>
      </main>
    </div>
  )
}

import { useState } from 'react'
import { LogIn, LogOut, UserRound } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import { useSession, authRedirectUrl } from '@/lib/use-session'
import { useT } from '../i18n'

type Mode = 'signin' | 'signup'
type Status = 'idle' | 'working' | 'confirm-sent' | 'error'

/**
 * Sign-in / account control for the nav. Signed out: popover with an
 * email + password form (sign in, or create an account — Supabase sends a
 * confirmation email before the first sign-in). Signed in: identity +
 * sign-out. Renders nothing when Supabase is not configured.
 */
export function AccountControl() {
  const t = useT()
  const { session, loading } = useSession()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorText, setErrorText] = useState('')

  if (!isSupabaseEnabled || !supabase) return null
  const sb = supabase

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    setStatus('working')
    if (mode === 'signin') {
      const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password })
      if (error) {
        setErrorText(error.message)
        setStatus('error')
      } else {
        setStatus('idle')
        setOpen(false)
        setPassword('')
      }
    } else {
      const { data, error } = await sb.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: authRedirectUrl() },
      })
      if (error) {
        setErrorText(error.message)
        setStatus('error')
      } else if (data.session) {
        // Email confirmation disabled server-side — signed in immediately.
        setStatus('idle')
        setOpen(false)
        setPassword('')
      } else {
        setStatus('confirm-sent')
      }
    }
  }

  const signOut = async () => {
    await sb.auth.signOut()
    setOpen(false)
  }

  const identity = session?.user.email ?? t.auth.anonymousUser

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setStatus('idle')
          setMode('signin')
          setPassword('')
        }
      }}
    >
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={session ? t.auth.account : t.auth.signIn}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium text-foreground/70 transition-colors outline-none hover:bg-foreground/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/70 sm:px-3"
          />
        }
      >
        {session ? <UserRound className="size-4 text-primary" aria-hidden /> : <LogIn className="size-4" aria-hidden />}
        <span className="hidden lg:inline">{loading ? '…' : session ? t.auth.account : t.auth.signIn}</span>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={10} className="w-72 p-4">
        {session ? (
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{t.auth.signedInAs}</p>
              <p className="mt-1 truncate text-sm font-semibold">{identity}</p>
            </div>
            <Separator />
            <Button variant="outline" size="sm" onClick={signOut} className="justify-start gap-2">
              <LogOut className="size-4" aria-hidden />
              {t.auth.signOut}
            </Button>
          </div>
        ) : status === 'confirm-sent' ? (
          <p className="rounded-lg bg-primary/10 p-3 text-sm text-foreground">{t.auth.confirmSent}</p>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold">{mode === 'signin' ? t.auth.title : t.auth.titleSignUp}</p>
            <form onSubmit={submit} className="flex flex-col gap-2">
              <Label htmlFor="account-email" className="text-xs">
                {t.auth.emailLabel}
              </Label>
              <Input
                id="account-email"
                type="email"
                required
                autoComplete="email"
                placeholder={t.auth.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Label htmlFor="account-password" className="text-xs">
                {t.auth.passwordLabel}
              </Label>
              <Input
                id="account-password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button type="submit" size="sm" disabled={status === 'working'} className="mt-1">
                {status === 'working' ? t.auth.working : mode === 'signin' ? t.auth.submitSignIn : t.auth.submitSignUp}
              </Button>
              {status === 'error' && <p className="text-xs text-destructive">{errorText || t.auth.error}</p>}
            </form>
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin')
                setStatus('idle')
              }}
              className="text-left text-xs font-medium text-primary underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/70"
            >
              {mode === 'signin' ? t.auth.toggleToSignUp : t.auth.toggleToSignIn}
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

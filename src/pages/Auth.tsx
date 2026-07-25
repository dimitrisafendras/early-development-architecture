import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, LogIn, MailCheck, UserPlus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { PageFrame } from '../components/PageFrame'
import { supabase, isSupabaseEnabled, setRememberMe, getRememberMe } from '@/lib/supabase'
import { useSession, authRedirectUrl } from '@/lib/use-session'
import { useT } from '../i18n'

export type AuthMode = 'signin' | 'signup'

/**
 * Only accept in-app destinations, so a crafted `?next=` can't bounce a
 * freshly-signed-in user off to another origin. `//host` is a protocol-relative
 * URL, not a local path.
 */
function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/'
  return raw
}

/**
 * Sign in / create account as full pages rather than a nav popover.
 *
 * The popover version was unusable on a phone: it is portalled outside the nav
 * dropdown that opened it, so the first tap into the email field registered as
 * an outside tap, closed the dropdown, and unmounted the form. A route has no
 * such lifetime problem, gets the whole viewport for the keyboard to push
 * against, and can be linked to and deep-linked from anywhere.
 */
export default function Auth({ mode }: { mode: AuthMode }) {
  const t = useT()
  const navigate = useNavigate()
  const { search } = useLocation()
  const { session } = useSession()

  const next = safeNext(new URLSearchParams(search).get('next'))
  const isSignUp = mode === 'signup'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(getRememberMe)
  const [busy, setBusy] = useState(false)
  const [errorText, setErrorText] = useState('')
  const [confirmSent, setConfirmSent] = useState(false)

  // Nothing to sign into when the backend isn't configured (local-only build).
  if (!isSupabaseEnabled || !supabase) return <Navigate to="/" replace />
  const sb = supabase
  // Already signed in — including the moment a submit succeeds, since the auth
  // listener updates the shared session and re-renders this page.
  if (session) return <Navigate to={next} replace />

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) return
    // Decide where the session is stored *before* it's created, so the auth
    // storage adapter routes the tokens to local- or sessionStorage.
    setRememberMe(remember)
    setBusy(true)
    setErrorText('')
    try {
      if (isSignUp) {
        const { data, error } = await sb.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: authRedirectUrl() },
        })
        if (error) setErrorText(error.message)
        else if (data.session) navigate(next, { replace: true })
        else setConfirmSent(true)
      } else {
        const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password })
        if (error) setErrorText(error.message)
        else navigate(next, { replace: true })
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    // The one sanctioned width exception to the shared frame: sign-in is a single
    // narrow card, so it keeps `max-w-md` (twMerge lets it win over `max-w-6xl`)
    // while inheriting the frame's gutter, padding and title styling.
    <PageFrame
      className="max-w-md"
      title={isSignUp ? t.auth.titleSignUp : t.auth.title}
      description={isSignUp ? t.auth.subtitleSignUp : t.auth.subtitleSignIn}
      aside={
        <span className="inline-flex shrink-0 rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 p-3 text-primary ring-1 ring-inset ring-primary/20">
          {isSignUp ? <UserPlus className="size-6" /> : <LogIn className="size-6" />}
        </span>
      }
      toolbar={
        <Link
          to="/"
          className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors outline-none hover:bg-foreground/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/70"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t.auth.back}
        </Link>
      }
    >
      {confirmSent ? (
        <Card>
          <CardContent className="flex items-start gap-3 py-6">
            <MailCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
            <div className="min-w-0">
              <p className="text-sm text-foreground">{t.auth.confirmSent}</p>
              <Link
                to={`/signin?next=${encodeURIComponent(next)}`}
                className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline"
              >
                {t.auth.submitSignIn}
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-6">
            <form onSubmit={submit} className="flex flex-col gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="auth-email">{t.auth.emailLabel}</Label>
                <Input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  inputMode="email"
                  enterKeyHint="next"
                  placeholder={t.auth.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="auth-password">{t.auth.passwordLabel}</Label>
                <Input
                  id="auth-password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  enterKeyHint="go"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {isSignUp && <p className="text-xs text-muted-foreground">{t.auth.passwordHint}</p>}
              </div>
              <Label
                htmlFor="auth-remember"
                className="group/field flex w-fit cursor-pointer items-center gap-2.5 text-sm font-normal text-muted-foreground"
              >
                <Checkbox
                  id="auth-remember"
                  checked={remember}
                  onCheckedChange={(value) => setRemember(value === true)}
                />
                {t.auth.rememberMe}
              </Label>
              {/* Deliberately not gated on the session probe: signing in does not
                  depend on knowing the current session, and gating here would
                  leave a dead button if that request were slow. */}
              <Button type="submit" size="lg" disabled={busy} className="w-full">
                {busy ? t.auth.working : isSignUp ? t.auth.submitSignUp : t.auth.submitSignIn}
              </Button>
              {errorText && (
                <p role="alert" className="text-sm text-destructive">
                  {errorText}
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      <Link
        to={`${isSignUp ? '/signin' : '/signup'}?next=${encodeURIComponent(next)}`}
        className="inline-flex min-h-11 items-center justify-center rounded-xl text-sm font-medium text-primary underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/70"
      >
        {isSignUp ? t.auth.toggleToSignIn : t.auth.toggleToSignUp}
      </Link>
    </PageFrame>
  )
}

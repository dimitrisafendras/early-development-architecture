import { useState } from 'react'
import { LogIn, LogOut, Mail, UserRound } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import { useSession, authRedirectUrl } from '@/lib/use-session'
import { useT } from '../i18n'

/** Google brand mark (lucide carries no brand icons). */
function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.86c2.26-2.09 3.58-5.17 3.58-8.81Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.28A7.19 7.19 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.63H1.29a12.01 12.01 0 0 0 0 10.74l3.98-3.09Z" />
      <path fill="#EA4335" d="M12 4.76c1.76 0 3.34.61 4.59 1.8l3.42-3.42C17.94 1.19 15.23 0 12 0 7.31 0 3.26 2.69 1.29 6.63l3.98 3.09C6.22 6.87 8.87 4.76 12 4.76Z" />
    </svg>
  )
}

type EmailState = 'idle' | 'sending' | 'sent' | 'error'

/**
 * Sign-in / account control for the nav. Signed out: popover with Google
 * OAuth and an email magic-link form. Signed in: popover with the account
 * identity and sign-out. Renders nothing when Supabase is not configured.
 */
export function AccountControl() {
  const t = useT()
  const { session, loading } = useSession()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [emailState, setEmailState] = useState<EmailState>('idle')

  if (!isSupabaseEnabled || !supabase) return null
  const sb = supabase

  const signInWithGoogle = () =>
    sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: authRedirectUrl() },
    })

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setEmailState('sending')
    const { error } = await sb.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: authRedirectUrl() },
    })
    setEmailState(error ? 'error' : 'sent')
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
        if (!next) setEmailState('idle')
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
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold">{t.auth.title}</p>
            <Button variant="outline" onClick={signInWithGoogle} className="justify-center gap-2">
              <GoogleMark />
              {t.auth.continueWithGoogle}
            </Button>
            <div className="flex items-center gap-2 text-[11px] tracking-wide text-muted-foreground uppercase">
              <Separator className="flex-1" /> {t.auth.or} <Separator className="flex-1" />
            </div>
            {emailState === 'sent' ? (
              <p className="rounded-lg bg-primary/10 p-3 text-sm text-foreground">{t.auth.linkSent}</p>
            ) : (
              <form onSubmit={sendMagicLink} className="flex flex-col gap-2">
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
                <Button type="submit" size="sm" disabled={emailState === 'sending'} className="gap-2">
                  <Mail className="size-4" aria-hidden />
                  {emailState === 'sending' ? t.auth.sending : t.auth.sendLink}
                </Button>
                {emailState === 'error' && <p className="text-xs text-destructive">{t.auth.error}</p>}
              </form>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

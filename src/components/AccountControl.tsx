import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LogIn, LogOut, UserRound } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import { useSession } from '@/lib/use-session'
import { useT } from '../i18n'

/**
 * Account control for the nav.
 *
 * Signed out it is a plain link to `/signin` — the form used to live in this
 * popover, which could not be filled in on a phone (see the note in
 * `pages/Auth.tsx`). Signed in it keeps a popover, which is safe: identity plus
 * a sign-out button, no text inputs and no keyboard.
 *
 * `variant="row"` is the full-width labelled form used inside the nav dropdown;
 * `"inline"` is the compact icon-first form for the desktop nav row.
 *
 * The sign-in entry point always shows; the signed-in popover only appears when
 * Supabase is configured (there can be no session otherwise).
 */
export function AccountControl({ variant = 'inline' }: { variant?: 'inline' | 'row' }) {
  const t = useT()
  const { pathname, search } = useLocation()
  const { session, loading } = useSession()
  const [open, setOpen] = useState(false)

  const isRow = variant === 'row'
  const triggerClass = cn(
    'inline-flex items-center gap-2 text-sm font-medium text-foreground/70 transition-colors outline-none hover:bg-foreground/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/70',
    isRow
      ? 'min-h-11 w-full justify-start rounded-xl px-3 active:bg-foreground/10'
      : 'min-h-11 rounded-full px-3 sm:min-h-0 sm:px-2.5 sm:py-1.5',
  )

  if (!session || !isSupabaseEnabled || !supabase) {
    // Come back to wherever the user was once they're in.
    const next = encodeURIComponent(`${pathname}${search}`)
    return (
      <Link to={`/signin?next=${next}`} aria-label={t.auth.signIn} className={triggerClass}>
        <LogIn className="size-4 shrink-0" aria-hidden />
        <span className={isRow ? undefined : 'hidden lg:inline'}>
          {loading ? '…' : t.auth.signIn}
        </span>
      </Link>
    )
  }
  const sb = supabase

  const email = session.user.email ?? t.auth.anonymousUser
  // The local part is the recognisable bit and fits the bar; the full address is
  // in the popover and the title attribute.
  const shortName = email.split('@')[0]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button type="button" aria-label={t.auth.account} title={email} className={triggerClass} />
        }
      >
        <UserRound className="size-4 shrink-0 text-primary" aria-hidden />
        <span
          className={cn('truncate', isRow ? 'max-w-[22ch]' : 'hidden max-w-[12ch] lg:inline')}
        >
          {shortName}
        </span>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={10} className="p-4">
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t.auth.signedInAs}
            </p>
            <p className="mt-1 truncate text-sm font-semibold">{email}</p>
          </div>
          <Separator />
          <Button
            variant="outline"
            size="sm"
            className="justify-start gap-2"
            onClick={() => {
              void sb.auth.signOut()
              setOpen(false)
            }}
          >
            <LogOut className="size-4" aria-hidden />
            {t.auth.signOut}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

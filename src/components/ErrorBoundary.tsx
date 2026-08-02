import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCw, Home } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { useT } from '../i18n'

/**
 * The last screen the app can show.
 *
 * This is a client-rendered SPA with no server fallback: a thrown render error
 * unmounts the whole tree and leaves a **blank white page** that still returns
 * HTTP 200. There is nothing to press, nothing that says what happened, and —
 * worst for this app — nothing that says the feeds and sessions already logged
 * are still there. A caregiver who opens the tracker at 3am and gets a white
 * screen has no way to tell "the page broke" from "my data is gone".
 *
 * Mounted **above the router**, so it survives whatever route was rendering. The
 * cost of that is real and stated: there is no `useLocation` up there, so the
 * boundary cannot reset itself on navigation. Both ways out are therefore full
 * page loads, which is also the only honest offer — the tree that threw is not
 * a tree worth re-rendering in place.
 *
 * `smoke.spec.ts` asserts every route renders with no console errors, which is
 * the test that keeps this from becoming somewhere bugs go to be hidden.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Logged rather than swallowed: the smoke suite fails a route that writes to
    // `console.error`, so a crash caught here is still a crash that fails CI.
    console.error('Unhandled render error', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return <CrashScreen error={this.state.error} />
  }
}

/**
 * The fallback itself, as a function component so it can read the language.
 *
 * It deliberately uses only the store and the message catalogue — no data hooks,
 * no network, no `Layout` — because everything it might otherwise reach for is a
 * candidate for whatever just threw.
 */
function CrashScreen({ error }: { error: Error }) {
  const t = useT()
  const home = import.meta.env.BASE_URL
  return (
    <main
      role="alert"
      className="flex min-h-svh items-center justify-center bg-background px-6 py-16 text-foreground"
    >
      <div className="flex w-full max-w-md flex-col items-start gap-5">
        <span className="grid size-11 place-items-center rounded-xl bg-destructive/10 text-destructive">
          <AlertTriangle className="size-5" />
        </span>
        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{t.crash.title}</h1>
          {/* The reassurance is the point of this screen, not decoration: the
              app is local-first, so a render crash genuinely cannot lose a
              logged feed — and a blank page is indistinguishable from one that
              did. */}
          <p className="text-sm leading-relaxed text-muted-foreground">{t.crash.body}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="md" onClick={() => window.location.reload()}>
            <RotateCw /> {t.crash.reload}
          </Button>
          {/* A real navigation, not a router link: the boundary sits above the
              router, so there is no in-app navigation left to perform. */}
          <a href={home} className={buttonVariants({ variant: 'outline', size: 'md' })}>
            <Home /> {t.crash.home}
          </a>
        </div>
        {/* Collapsed, and last. A caregiver does not need the stack; the person
            they send a screenshot to does. */}
        <details className="w-full text-xs text-muted-foreground">
          <summary className="cursor-pointer select-none">{t.crash.detailsLabel}</summary>
          <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-muted p-3 whitespace-pre-wrap">
            {error.message}
          </pre>
        </details>
      </div>
    </main>
  )
}

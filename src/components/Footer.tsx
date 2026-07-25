import { useT } from '../i18n'

export function Footer() {
  const t = useT()
  return (
    <footer className="mt-12 border-t border-border bg-card py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] text-xs text-muted-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-1 page-px text-center sm:flex-row sm:gap-2">
        <span className="font-heading font-semibold text-foreground">{t.footer.title}</span>
        <span className="hidden text-border sm:inline" aria-hidden>
          ·
        </span>
        <span>{t.footer.tagline}</span>
      </div>
    </footer>
  )
}

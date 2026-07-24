import { useT } from '../i18n'

export function Footer() {
  const t = useT()
  return (
    <footer className="mt-16 border-t border-border bg-card pt-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))] text-center text-xs text-muted-foreground">
      <div className="mx-auto w-full max-w-7xl page-px">
        <div className="mb-3 font-heading text-[15px] font-semibold tracking-tight text-foreground">
          {t.footer.title}
        </div>
        <p className="mx-auto mb-4 max-w-xl text-muted-foreground">{t.footer.body}</p>
        <div className="border-t border-border pt-4 text-muted-foreground">{t.footer.tagline}</div>
      </div>
    </footer>
  )
}

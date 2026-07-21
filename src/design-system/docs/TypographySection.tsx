import { fontFamilies, typeScale, weights } from '../tokens'
import { DocSection, DocBlock, Panel } from './primitives'

export function TypographySection() {
  return (
    <DocSection
      id="typography"
      eyebrow="Typography"
      title="Geist, tuned for hierarchy"
      intro="One variable family carries the whole system. Hierarchy comes from size, weight and tracking rather than switching typefaces."
    >
      <DocBlock title="Families">
        <div className="grid gap-3 sm:grid-cols-2">
          {fontFamilies.map((f) => (
            <Panel key={f.role} className="p-5">
              <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">{f.role}</p>
              <p className="mt-2 font-heading text-2xl font-semibold tracking-tight">Aa Bb Cc 0123</p>
              <code className="mt-3 block text-xs text-muted-foreground">{f.stack}</code>
              <p className="mt-1 text-sm text-muted-foreground">{f.note}</p>
            </Panel>
          ))}
        </div>
      </DocBlock>

      <DocBlock title="Type scale" description="Display through caption. px shown for reference only — author in rem.">
        <Panel className="divide-y divide-border p-0">
          {typeScale.map((t) => (
            <div key={t.name} className="flex flex-col gap-2 px-5 py-5 sm:flex-row sm:items-baseline sm:gap-6">
              <div className="w-28 shrink-0 text-xs text-muted-foreground">
                <div className="font-semibold text-foreground">{t.name}</div>
                <div className="tabular-nums">
                  {t.px}px · {t.weight}
                </div>
                <div className="tabular-nums">lh {t.lineHeight}</div>
              </div>
              <div
                className="min-w-0 flex-1 truncate text-foreground"
                style={{
                  fontSize: t.size,
                  fontWeight: t.weight,
                  lineHeight: t.lineHeight,
                  letterSpacing: t.tracking,
                }}
              >
                {t.sample}
              </div>
            </div>
          ))}
        </Panel>
      </DocBlock>

      <DocBlock title="Weights" description="The variable axis exposes the full range; these four carry the UI.">
        <Panel>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {weights.map((w) => (
              <div key={w.value}>
                <div className="text-3xl tracking-tight" style={{ fontWeight: w.value }}>
                  Ag
                </div>
                <div className="mt-1 text-sm font-medium">{w.name}</div>
                <div className="text-xs tabular-nums text-muted-foreground">{w.value}</div>
              </div>
            ))}
          </div>
        </Panel>
      </DocBlock>
    </DocSection>
  )
}

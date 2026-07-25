import { DocSection, DocBlock, Panel, DoDont } from './primitives'

/**
 * The numeric conventions an alignment audit settled. Every row is a *number*,
 * not an adjective, because "consistent card padding" is unfalsifiable and
 * "16px" is not. Each row also names what it replaced, so the next contributor
 * can tell a decision from an accident.
 */

interface Row {
  what: string
  value: string
  replaced: string
}

const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{children}</code>
)

const surface: Row[] = [
  {
    what: 'Content surface',
    value: 'shadcn Card',
    replaced: '13 raw divs hand-rolling rounded-* border bg-card p-*',
  },
  {
    what: 'Radius',
    value: 'rounded-xl = 14px',
    replaced: 'rounded-lg (10px) x11, rounded-xl x5 and rounded-2xl (18px) x5, all for one role',
  },
  {
    what: 'Edge',
    value: 'ring-1 ring-foreground/10',
    replaced: 'border-* on Cards, which is dead code: Card has no border-width, so those outlines never rendered',
  },
  {
    what: 'Interior padding',
    value: '--card-spacing = 16px',
    replaced: '16 / 32 / 40 / 56px, because a py-* on CardContent adds to the Card’s own py-4',
  },
  {
    what: 'Roomier surface',
    value: '[--card-spacing:--spacing(6)] on the Card',
    replaced: 'py-6 or py-10 on CardContent, which double-pads',
  },
  {
    what: 'Sub-panel inside a Card',
    value: 'rounded-xl bg-muted p-4, no border',
    replaced: 'bg-card on a Card (invisible), at p-2 / p-2.5 / p-3 / p-5 / p-6',
  },
]

const spacing: Row[] = [
  {
    what: 'Card stack, or a grid of sibling cards',
    value: 'gap-4 = 16px',
    replaced: 'gap-3, gap-4, gap-6, gap-8 and gap-12 for the same stack',
  },
  { what: 'Chart beside its list (2-col split)', value: 'gap-6 = 24px', replaced: 'gap-8 inside a card' },
  { what: 'Between page blocks and tiers', value: 'gap-6, gap-8 from sm', replaced: 'per-page mt-4 / mt-8' },
  { what: 'Divider inside a card', value: 'border-t border-border/70 pt-4', replaced: 'pt-3 / pt-4 / pt-5' },
  {
    what: 'Divider between tiers',
    value: 'border-t border-border/70 pt-8',
    replaced: 'border-border at full opacity in places',
  },
  {
    what: 'Tile row',
    value: 'grid grid-cols-2 gap-4 lg:grid-cols-4',
    replaced: 'sm:grid-cols-3 xl:grid-cols-4 on the topic grid, so two tile systems disagreed at lg',
  },
  { what: '4-up card row', value: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4', replaced: 'md:grid-cols-2 variants' },
  {
    what: '3-up card row',
    value: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    replaced: 'sm:grid-cols-3, md:grid-cols-2, lg:grid-cols-5',
  },
]

const type: Row[] = [
  {
    what: 'Page title (h1)',
    value: 'font-heading text-2xl sm:text-4xl font-semibold',
    replaced: 'a compact variant only one route used, so the title changed size on navigation',
  },
  {
    what: 'Page description',
    value: 'hidden below sm; text-base mt-4 from sm',
    replaced: 'an always-on 3-line header eating the top third of a phone',
  },
  {
    what: 'Section heading (h2)',
    value: 'font-heading text-xl font-semibold',
    replaced: 'text-4xl font-bold chapter numerals outweighing the h1',
  },
  {
    what: 'Card title',
    value: 'text-[15px] font-semibold with a 16px icon',
    replaced: 'bare font-semibold (14px) x8, text-lg x2, and 9 hand-rolled copies of WidgetCard’s header',
  },
  { what: 'Card body', value: 'text-[13px] leading-relaxed', replaced: 'text-xs in 4 places' },
  {
    what: 'Eyebrow',
    value: 'text-xs font-semibold uppercase tracking-[0.16em]',
    replaced: '12 spellings: sizes 10/11/12/14px, tracking 0.05/0.14/0.16/0.18em, weights 400/500/600/700',
  },
  {
    what: 'Eyebrow standing in for a heading',
    value: 'the same, at text-sm (14px)',
    replaced: 'text-xs muted for a sub-block heading role',
  },
]

const controls: Row[] = [
  {
    what: 'Control height (default)',
    value: 'h-11 on a phone, h-8 from sm',
    replaced: 'ChoiceGroup defaulting to lg (h-11 sm:h-9), 4px off every row it sat in',
  },
  {
    what: 'Control radius',
    value: '10px, shared by Input, DatePicker, NumberInput and Button',
    replaced: 'a stepper that invented its own field chrome',
  },
  { what: 'Icon inline with text', value: 'size-4 = 16px', replaced: 'size-3, size-5 and size-[18px] for one role' },
  { what: 'Trailing chevron or arrow', value: 'size-3.5 = 14px', replaced: 'size-5 arrows in the pager' },
  {
    what: 'Icon chip',
    value: 'IconChip: sm 16px, md 20px, lg 24px',
    replaced: '5 chip spellings across p-2 / p-2.5 / p-3 / size-7 / size-8 / size-11',
  },
  {
    what: 'Pill',
    value: 'Badge: 26px, rounded-full, text-xs font-semibold',
    replaced: '7 hand-rolled pills; Badge itself was rounded-4xl and too small to adopt',
  },
  {
    what: 'Toggle set',
    value: 'ChoiceGroup',
    replaced: 'a raw button group at a non-responsive size-9 (36px) beside 44px controls',
  },
  {
    what: 'Empty or gated state',
    value: 'EmptyState: Card, py-10, centred 14px muted text',
    replaced: '3 near-identical copies at 3 paddings, plus bare paragraphs',
  },
]

function ConventionTable({ rows }: { rows: Row[] }) {
  return (
    <Panel flush className="overflow-x-auto">
      <table className="w-full min-w-[48rem] text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            {['Role', 'The number', 'What it replaced'].map((h) => (
              <th
                key={h}
                className="px-5 py-3 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.what} className="border-b border-border align-top last:border-0">
              <td className="px-5 py-3 font-medium text-foreground">{r.what}</td>
              <td className="px-5 py-3">
                <Code>{r.value}</Code>
              </td>
              <td className="px-5 py-3 text-muted-foreground">{r.replaced}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  )
}

export function ConventionsSection() {
  return (
    <DocSection
      id="conventions"
      eyebrow="Conventions"
      title="The numbers, and what they replaced"
      intro="A design system that says “keep spacing consistent” cannot be broken, because it cannot be checked. These are the values an app-wide alignment audit settled on: one number per role, with the drift each one replaced, so a future contributor can tell a decision from an accident and knows which way to jump when two options look equally fine."
    >
      <DocBlock
        title="Surfaces"
        description="One card, one radius, one edge, one padding. A surface that looks like a Card must be a Card."
      >
        <ConventionTable rows={surface} />
      </DocBlock>

      <DocBlock
        title="Spacing & grids"
        description="Four gaps in total. If a new layout seems to need a fifth, it is probably one of these four."
      >
        <ConventionTable rows={spacing} />
      </DocBlock>

      <DocBlock
        title="Type"
        description="Five sizes carry the whole app: 36/24 for the h1, 20 for an h2, 15 for a card title, 13 for card body, 12 for an eyebrow."
      >
        <ConventionTable rows={type} />
      </DocBlock>

      <DocBlock
        title="Controls & marks"
        description="Everything that shares a row must share a height. 44px on a phone is a touch-target floor, not a style."
      >
        <ConventionTable rows={controls} />
      </DocBlock>

      <DocBlock
        title="The shared components these live in"
        description="Reach for one of these before writing markup. If one almost fits, extend it: they are owned source."
      >
        <Panel>
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="font-heading text-sm font-semibold">Frame & rhythm</p>
              <p className="mt-1 leading-relaxed text-muted-foreground">
                <Code>PageFrame</Code>, <Code>WidgetPage</Code>, <Code>WidgetStatGrid</Code>,{' '}
                <Code>WidgetCard</Code>, <Code>WidgetSplit</Code>, <Code>SectionHeader</Code>
              </p>
            </div>
            <div>
              <p className="font-heading text-sm font-semibold">Marks & states</p>
              <p className="mt-1 leading-relaxed text-muted-foreground">
                <Code>Eyebrow</Code>, <Code>IconChip</Code>, <Code>StatTile</Code>, <Code>EmptyState</Code>,{' '}
                <Code>AgeBadge</Code>, <Code>ProgressRing</Code>, <Code>ChoiceGroup</Code>,{' '}
                <Code>GlassScrollArea</Code>
              </p>
            </div>
            <div>
              <p className="font-heading text-sm font-semibold">Semantic tone</p>
              <p className="mt-1 leading-relaxed text-muted-foreground">
                <Code>lib/tone.ts</Code> holds one <Code>statusTone</Code> and one <Code>scheduleTone</Code>,
                replacing six duplicated hue tables that disagreed on their light shade. Text uses the{' '}
                <Code>700</Code> step (AA at 5:1 or better); glyphs and chip icons use <Code>600</Code>, since
                3:1 is the bar for a non-text graphic.
              </p>
            </div>
            <div>
              <p className="font-heading text-sm font-semibold">Colour</p>
              <p className="mt-1 leading-relaxed text-muted-foreground">
                Always shadcn token classes, so both themes and both palettes work. Raw Tailwind hues are for
                semantically fixed meaning only (success, warning, danger), and even then they come from{' '}
                <Code>tone.ts</Code> rather than being re-typed. A raw hex in a <Code>style</Code> prop cannot
                respond to either axis.
              </p>
            </div>
          </div>
        </Panel>
      </DocBlock>

      <DocBlock title="Do & Don't">
        <DoDont
          dos={[
            'Pick the number from the table, not from the component next to you.',
            'Use Card for anything that reads as a card, and let it own the radius.',
            'Give every surface 16px of interior padding; ask the Card for 24px.',
            'Use Eyebrow, IconChip, Badge and EmptyState instead of re-typing them.',
            'Extract a shared component the second time a pattern appears.',
          ]}
          donts={[
            'Put py-* on CardContent; it adds to the Card’s own padding.',
            'Put border-* on a Card; it has no border-width, so nothing renders.',
            'Invent a fifth gap, a sixth type size or a fourth icon size.',
            'Mix control sizes in one row; check against the h-11 / h-8 pair.',
            'Hard-code a hue where a token exists, or a hex in a style prop.',
          ]}
        />
      </DocBlock>
    </DocSection>
  )
}

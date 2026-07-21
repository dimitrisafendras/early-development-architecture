import { useT } from '../i18n'

interface Props {
  module: number
  title: string
  description: string
}

export function SectionHeader({ module, title, description }: Props) {
  const t = useT()
  return (
    <div className="mb-8 max-w-3xl">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        {t.common.module} {module}
      </p>
      <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}

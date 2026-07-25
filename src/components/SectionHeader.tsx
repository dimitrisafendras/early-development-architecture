interface Props {
  /** Legacy module number — accepted for back-compat but no longer displayed. */
  module?: number
  title: string
  description: string
}

export function SectionHeader({ title, description }: Props) {
  return (
    <div className="mb-8 max-w-3xl">
      <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}

import { Badge } from '@/components/ui/badge'

interface Props {
  module: number
  title: string
  description: string
}

export function SectionHeader({ module, title, description }: Props) {
  return (
    <div className="mb-6">
      <Badge className="bg-accent text-accent-foreground border-transparent text-[11px] font-bold uppercase tracking-[0.15em]">
        Module {module}
      </Badge>
      <h2 className="mt-3 mb-1 font-heading text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
        {title}
      </h2>
      <p className="m-0 max-w-3xl text-muted-foreground">{description}</p>
    </div>
  )
}

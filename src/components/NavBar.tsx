import { Link } from 'react-router-dom'
import {
  Calendar,
  CheckSquare,
  Monitor,
  Music,
  Network,
  Palette,
  RefreshCw,
  Baby,
} from 'lucide-react'

const items = [
  { href: '#neurobiology', label: 'Brain Growth', Icon: Network },
  { href: '#serve-return', label: 'Serve & Return', Icon: RefreshCw },
  { href: '#language-music', label: 'Parentese & Music', Icon: Music },
  { href: '#tummy-time', label: 'Tummy Time', Icon: Baby },
  { href: '#routine', label: 'Daily Schedule', Icon: Calendar },
  { href: '#environment', label: 'Video Deficit', Icon: Monitor },
  { href: '#summary', label: 'Action Items', Icon: CheckSquare },
]

export function NavBar() {
  return (
    <nav className="sticky-nav">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="flex items-center gap-1 overflow-x-auto py-2">
          <div className="flex items-center gap-1">
            {items.map(({ href, label, Icon }) => (
              <a
                key={href}
                href={href}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </a>
            ))}
          </div>
          <Link
            to="/design-system"
            className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-accent"
          >
            <Palette className="size-4" aria-hidden />
            Design System
          </Link>
        </div>
      </div>
    </nav>
  )
}

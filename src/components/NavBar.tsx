import { Anchor } from 'antd'
import {
  ApartmentOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  CustomerServiceOutlined,
  DesktopOutlined,
  SmileOutlined,
  SyncOutlined,
} from '@ant-design/icons'

const items = [
  { key: 'neurobiology', href: '#neurobiology', title: <><ApartmentOutlined /> Brain Growth</> },
  { key: 'serve-return', href: '#serve-return', title: <><SyncOutlined /> Serve & Return</> },
  { key: 'language-music', href: '#language-music', title: <><CustomerServiceOutlined /> Parentese & Music</> },
  { key: 'tummy-time', href: '#tummy-time', title: <><SmileOutlined /> Tummy Time</> },
  { key: 'routine', href: '#routine', title: <><CalendarOutlined /> Daily Schedule</> },
  { key: 'environment', href: '#environment', title: <><DesktopOutlined /> Video Deficit</> },
  { key: 'summary', href: '#summary', title: <><CheckSquareOutlined /> Action Items</> },
]

export function NavBar() {
  return (
    <nav className="sticky-nav">
      <div className="container">
        <Anchor direction="horizontal" targetOffset={80} items={items} />
      </div>
    </nav>
  )
}

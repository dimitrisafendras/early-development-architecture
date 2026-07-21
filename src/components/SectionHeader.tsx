import { Tag, Typography } from 'antd'

const { Title, Paragraph } = Typography

interface Props {
  module: number
  title: string
  description: string
}

export function SectionHeader({ module, title, description }: Props) {
  return (
    <div style={{ marginBottom: 24 }}>
      <Tag color="blue" style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, fontSize: 11 }}>
        Module {module}
      </Tag>
      <Title level={2} style={{ marginTop: 8, marginBottom: 4, fontWeight: 800, color: 'var(--text-primary)' }}>
        {title}
      </Title>
      <Paragraph style={{ color: 'var(--text-secondary)', margin: 0 }}>{description}</Paragraph>
    </div>
  )
}

import { Card, Col, Row, Typography } from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import { SectionHeader } from '../components/SectionHeader'
import { scheduleBlocks } from '../data'

const { Text } = Typography

export function Routine() {
  return (
    <section id="routine">
      <SectionHeader
        module={5}
        title="📅 Daily Routine Architecture (Caregiver & Infant)"
        description="A predictable yet adaptable rhythm balancing direct engagement, physical tummy sessions, sensory regulation, and caregiver recovery."
      />
      <Row gutter={[24, 24]}>
        {scheduleBlocks.map((block) => (
          <Col xs={24} md={12} lg={8} key={block.time}>
            <Card
              style={{
                height: '100%',
                background: block.dark ? '#0f172a' : undefined,
                borderColor: block.dark ? '#1e293b' : undefined,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: block.color, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                    {block.time}
                  </div>
                  <Text strong style={{ fontSize: 18, color: block.dark ? '#fff' : 'var(--text-primary)' }}>{block.title}</Text>
                  <div style={{ marginTop: 12 }}>
                    {block.items.map((item) => (
                      <div key={item.strong} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, color: block.dark ? '#cbd5e1' : 'var(--text-secondary)' }}>
                        <CheckOutlined style={{ color: block.dark ? '#818cf8' : '#10b981', marginTop: 3 }} />
                        <span><strong>{item.strong}</strong> {item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${block.dark ? '#1e293b' : 'var(--border)'}`, fontSize: 11, fontWeight: 600, color: block.color, background: block.dark ? '#1e293b' : block.bg, padding: 8, borderRadius: 8 }}>
                  {block.focus}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  )
}

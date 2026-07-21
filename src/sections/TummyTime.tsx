import { Card, Col, Row, Tag, Typography } from 'antd'
import { WarningOutlined } from '@ant-design/icons'
import { SectionHeader } from '../components/SectionHeader'
import { TummyTimeChart } from '../components/charts'

const { Text, Paragraph } = Typography

export function TummyTime() {
  return (
    <section id="tummy-time">
      <SectionHeader
        module={4}
        title="Physical Optimization: Daily Tummy Time"
        description="Supervised tummy time while awake is essential for neck, back, and shoulder core strength, motor milestone progression, and preventing flat spots (plagiocephaly)."
      />
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <Text strong style={{ fontSize: 15 }}>Tummy Time Progression Target</Text>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Cumulative minutes per day from birth to 4 months</div>
              </div>
              <Tag color="green">Physical Milestone</Tag>
            </div>
            <TummyTimeChart />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Row gutter={[0, 16]}>
            <Col xs={24}>
              <Card>
                <Text strong>🦴 Biomechanical Benefits</Text>
                <ul style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '8px 0 0', paddingLeft: 18 }}>
                  <li>Strengthens extensor muscles in neck, spine, and trunk.</li>
                  <li>Prepares upper limbs for pushing up, rolling, and crawling.</li>
                  <li>Prevents <em>positional plagiocephaly</em> (flat spots on skull).</li>
                  <li>Enhances spatial perception and visual-motor integration.</li>
                </ul>
              </Card>
            </Col>
            <Col xs={24}>
              <Card style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
                <Text strong style={{ color: '#92400e' }}>
                  <WarningOutlined /> Crucial Safety Directive
                </Text>
                <Paragraph style={{ color: '#92400e', fontSize: 13, margin: '4px 0 0' }}>
                  Tummy time is exclusively for when the infant is <strong>awake and 100% supervised by an adult</strong>.
                  For sleep, infants must ALWAYS be placed strictly on their back on a flat, firm surface.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24}>
              <Card>
                <Text strong>Pro-Tips for Content Tummy Time</Text>
                <Row gutter={8} style={{ marginTop: 8 }}>
                  <Col span={12}>
                    <div style={{ background: 'var(--surface-subtle)', padding: 10, borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                      <strong>Chest-to-Chest:</strong> Lay on your back with baby on your chest for comfort.
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ background: 'var(--surface-subtle)', padding: 10, borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                      <strong>High Contrast:</strong> Place black-and-white cards at eye level.
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </section>
  )
}

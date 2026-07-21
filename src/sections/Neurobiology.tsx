import { Card, Col, Row, Typography } from 'antd'
import { ScissorOutlined, ThunderboltOutlined, HeartOutlined } from '@ant-design/icons'
import { SectionHeader } from '../components/SectionHeader'
import { BrainGrowthChart } from '../components/charts'

const { Text, Paragraph } = Typography

export function Neurobiology() {
  return (
    <section id="neurobiology">
      <SectionHeader
        module={1}
        title="The Biological Imperative: Explosive Brain Growth"
        description="An infant's brain doubles in size during the first year, establishing the neural architecture for a lifetime of cognitive, emotional, and social capacity."
      />
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={10}>
          <Card>
            <Text strong style={{ fontSize: 15 }}>Brain Mass % relative to Adult Size</Text>
            <div style={{ marginTop: 16 }}>
              <BrainGrowthChart />
            </div>
            <Row gutter={8} style={{ marginTop: 16, textAlign: 'center' }}>
              <Col span={8}>
                <div style={{ background: 'var(--surface-subtle)', borderRadius: 8, padding: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Newborn</div>
                  <div style={{ fontWeight: 700 }}>25%</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ background: '#e0f2fe', borderRadius: 8, padding: 8 }}>
                  <div style={{ fontSize: 12, color: '#0369a1' }}>1 Year</div>
                  <div style={{ fontWeight: 700, color: '#075985' }}>70%</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ background: 'var(--surface-subtle)', borderRadius: 8, padding: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Adult</div>
                  <div style={{ fontWeight: 700 }}>100%</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Card style={{ height: '100%' }}>
                <ThunderboltOutlined style={{ fontSize: 22, color: '#d97706', background: '#fef3c7', padding: 10, borderRadius: 12 }} />
                <Text strong style={{ display: 'block', margin: '12px 0 4px', fontSize: 15 }}>Synaptogenesis Surge</Text>
                <Paragraph style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>
                  Neurons form over 1 million new synaptic connections every single second. Sensory inputs
                  (eye contact, gentle touch, rhythmic voice) determine which synapses are preserved.
                </Paragraph>
                <div style={{ marginTop: 12, fontSize: 12, fontWeight: 600, color: '#b45309', background: '#fffbeb', padding: 8, borderRadius: 8 }}>
                  ⚡ Action: High-quality engagement reinforces synapses.
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card style={{ height: '100%' }}>
                <ScissorOutlined style={{ fontSize: 22, color: '#0284c7', background: '#e0f2fe', padding: 10, borderRadius: 12 }} />
                <Text strong style={{ display: 'block', margin: '12px 0 4px', fontSize: 15 }}>Pruning Mechanism</Text>
                <Paragraph style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>
                  Unused neural connections are systematically pruned away. Consistent interaction "lights up"
                  specific pathways, converting temporary brain activity into permanent structure.
                </Paragraph>
                <div style={{ marginTop: 12, fontSize: 12, fontWeight: 600, color: '#075985', background: '#f0f9ff', padding: 8, borderRadius: 8 }}>
                  💡 "Neurons that fire together, wire together."
                </div>
              </Card>
            </Col>
            <Col xs={24}>
              <Card>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <HeartOutlined style={{ fontSize: 24, color: '#059669', background: '#d1fae5', padding: 12, borderRadius: 12 }} />
                  <div>
                    <Text strong style={{ fontSize: 15 }}>Coregulation & Stress System Calibration</Text>
                    <Paragraph style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '4px 0 0' }}>
                      A newborn cannot regulate their own nervous system. Prompt, soothing responses to distress
                      buffer the infant's brain against high cortisol levels, setting up healthy HPA-axis (stress
                      response) baseline controls.
                    </Paragraph>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </section>
  )
}

import { Button, Card, Col, Row, Typography } from 'antd'
import { SlidersOutlined } from '@ant-design/icons'
import { SectionHeader } from '../components/SectionHeader'
import { serveReturnSteps, latencyOutcomes } from '../data'
import { useAppStore, type LatencyMode } from '../store'

const { Text, Paragraph } = Typography

const modes: LatencyMode[] = ['optimal', 'delayed', 'none']

export function ServeReturn() {
  const latency = useAppStore((s) => s.latency)
  const setLatency = useAppStore((s) => s.setLatency)
  const outcome = latencyOutcomes[latency]

  return (
    <section id="serve-return">
      <SectionHeader
        module={2}
        title='The "Serve and Return" Interaction Loop'
        description="Harvard Center on the Developing Child highlights that social interactions function like a game of tennis. The infant serves a cue; the caregiver immediately returns it."
      />
      <Card>
        <Row gutter={[16, 16]}>
          {serveReturnSteps.map((step) => (
            <Col xs={24} md={6} key={step.num}>
              <div style={{ background: step.bg, border: `1px solid ${step.border}`, borderRadius: 12, padding: 20, height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ width: 28, height: 28, borderRadius: '50%', background: step.badge, color: '#fff', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {step.num}
                  </span>
                </div>
                <Text strong style={{ display: 'block', marginBottom: 4, color: '#1e293b' }}>{step.title}</Text>
                <Paragraph style={{ color: '#475569', fontSize: 12, margin: 0 }}>{step.desc}</Paragraph>
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${step.border}`, fontSize: 11, color: '#64748b' }}>
                  {step.foot}
                </div>
              </div>
            </Col>
          ))}
        </Row>

        <div style={{ marginTop: 32, background: 'var(--surface-subtle)', border: '1px solid var(--border)', padding: 20, borderRadius: 12 }}>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>
            <SlidersOutlined style={{ color: '#0ea5e9' }} /> Interactive Responsiveness Simulator
          </Text>
          <Paragraph style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
            Select a caregiver response delay to see how timing impacts neural alertness & stress hormones:
          </Paragraph>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {modes.map((mode) => (
              <Button
                key={mode}
                type={latency === mode ? 'primary' : 'default'}
                onClick={() => setLatency(mode)}
                style={latency === mode ? { background: latencyOutcomes[mode].buttonColor, borderColor: latencyOutcomes[mode].buttonColor } : undefined}
              >
                {latencyOutcomes[mode].buttonLabel}
              </Button>
            ))}
          </div>
          <div style={{ background: 'var(--surface)', padding: 16, borderRadius: 8, border: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, color: outcome.color, marginBottom: 4 }}>{outcome.title}</div>
            <Paragraph style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>{outcome.desc}</Paragraph>
          </div>
        </div>
      </Card>
    </section>
  )
}

import { Card, Col, Progress, Row, Typography } from 'antd'
import { StopOutlined, EyeInvisibleOutlined, TeamOutlined } from '@ant-design/icons'
import { SectionHeader } from '../components/SectionHeader'
import { efficiencyScores } from '../data'

const { Text, Paragraph } = Typography

const reasons = [
  {
    icon: <StopOutlined />,
    color: '#dc2626',
    bg: '#fef2f2',
    strong: 'Lack of 3D Contingency:',
    text: "Screen characters cannot respond to the infant's 1-4 second serve. The feedback loop breaks, causing frustration or passive brain states.",
  },
  {
    icon: <EyeInvisibleOutlined />,
    color: '#d97706',
    bg: '#fffbeb',
    strong: 'Background TV Overhead:',
    text: 'Constant background noise reduces caregiver word count by 500–1000 words per hour and fragments infant sustained attention.',
  },
  {
    icon: <TeamOutlined />,
    color: '#059669',
    bg: '#ecfdf5',
    strong: 'Live Human Primacy:',
    text: 'Babies learn language exclusively from live human social gaze and joint attention in the first 18–24 months.',
  },
]

export function Environment() {
  return (
    <section id="environment">
      <SectionHeader
        module={6}
        title="Environmental Architecture: Screen Deficit vs. Live Interaction"
        description="Infant brains cannot transfer 2D screen stimuli into real-world comprehension—a phenomenon known in developmental psychology as the Video Deficit Effect."
      />
      <Card>
        <Row gutter={[32, 32]} align="middle">
          <Col xs={24} md={12}>
            <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 12 }}>Why Screens Fail Newborn Neural Wiring</Text>
            {reasons.map((reason) => (
              <div key={reason.strong} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: reason.bg, padding: 12, borderRadius: 12, marginBottom: 12 }}>
                <span style={{ color: reason.color, marginTop: 2 }}>{reason.icon}</span>
                <div style={{ fontSize: 13, color: '#334155' }}>
                  <strong>{reason.strong}</strong> {reason.text}
                </div>
              </div>
            ))}
          </Col>
          <Col xs={24} md={12}>
            <div style={{ background: 'var(--surface-subtle)', padding: 24, borderRadius: 12 }}>
              <Text strong style={{ display: 'block', textAlign: 'center', marginBottom: 16 }}>Developmental Efficiency Score</Text>
              {efficiencyScores.map((score) => (
                <div key={score.label} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 4, color: score.color }}>
                    <span>{score.label}</span>
                    <span>{score.text}</span>
                  </div>
                  <Progress percent={score.value} showInfo={false} strokeColor={score.color} trailColor="var(--border)" />
                </div>
              ))}
              <Paragraph style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic', margin: '16px 0 0' }}>
                * Based on EEG theta/beta power ratios and eye-tracking habituation studies in infant psychology literature.
              </Paragraph>
            </div>
          </Col>
        </Row>
      </Card>
    </section>
  )
}

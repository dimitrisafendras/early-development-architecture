import { Button, Col, Row, Switch, Tag, Typography } from 'antd'
import { CheckSquareOutlined, ClockCircleOutlined, ExperimentOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import { heroMetrics } from '../data'
import { useAppStore } from '../store'

const { Title, Paragraph } = Typography

export function Hero() {
  const dark = useAppStore((s) => s.dark)
  const toggleTheme = useAppStore((s) => s.toggleTheme)

  return (
    <header className="gradient-hero" style={{ color: '#fff', padding: '40px 0 64px', position: 'relative', overflow: 'hidden' }}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <Switch
            checked={dark}
            onChange={toggleTheme}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
          />
        </div>
        <Row justify="space-between" align="middle" gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <Tag
              icon={<ExperimentOutlined style={{ color: '#fbbf24' }} />}
              style={{
                background: 'rgba(2, 132, 199, 0.2)',
                color: '#e0f2fe',
                border: '1px solid rgba(2, 132, 199, 0.3)',
                borderRadius: 999,
                padding: '4px 12px',
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              Evidence-Based Early Psychology & Neuroscience
            </Tag>
            <Title style={{ color: '#fff', fontWeight: 800, margin: '0 0 8px' }}>
              The Architecture of Early Development
            </Title>
            <Paragraph style={{ color: '#cbd5e1', fontSize: 17, maxWidth: 640, margin: 0 }}>
              A comprehensive visual infographic mapping neurobiological foundations, acoustic language
              scaffolding, tummy time optimization, and daily caregiver routines.
            </Paragraph>
          </Col>
          <Col>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Button
                size="large"
                icon={<CheckSquareOutlined />}
                href="#summary"
                style={{ background: '#f59e0b', border: 'none', color: '#0f172a', fontWeight: 700 }}
              >
                Caregiver Checklist
              </Button>
              <Button
                size="large"
                icon={<ClockCircleOutlined />}
                href="#routine"
                style={{ background: '#1e293b', border: '1px solid #475569', color: '#fff' }}
              >
                Daily Schedule
              </Button>
            </div>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 32, paddingTop: 32, borderTop: '1px solid rgba(51, 65, 85, 0.6)' }}>
          {heroMetrics.map((metric) => (
            <Col xs={12} md={6} key={metric.label}>
              <div className="metric-card">
                <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                  {metric.label}
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: metric.color }}>{metric.value}</div>
                <div style={{ color: '#cbd5e1', fontSize: 12, marginTop: 4 }}>{metric.note}</div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </header>
  )
}

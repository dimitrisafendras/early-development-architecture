import { Card, Col, Row, Tag, Typography } from 'antd'
import { CustomerServiceOutlined, SoundOutlined, AudioOutlined } from '@ant-design/icons'
import { SectionHeader } from '../components/SectionHeader'
import { ParenteseChart } from '../components/charts'

const { Text, Paragraph } = Typography

const cards = [
  {
    icon: <CustomerServiceOutlined />,
    color: '#a21caf',
    bg: '#fae8ff',
    title: 'Role of Music & Singing',
    text: 'Soft lullabies and rhythmic tunes activate auditory-motor networks simultaneously. Studies show live singing by caregivers reduces infant heart rate and cortisol levels more effectively than spoken voice alone.',
  },
  {
    icon: <SoundOutlined />,
    color: '#d97706',
    bg: '#fef3c7',
    title: 'Acoustic Safety Rules',
    text: 'Keep music and environment sound below 60 decibels (about conversational volume). Continuous loud background audio disrupts phoneme discrimination and creates sensory fatigue.',
  },
  {
    icon: <AudioOutlined />,
    color: '#059669',
    bg: '#d1fae5',
    title: 'Phonetic Discrimination',
    text: 'Newborns are born "citizens of the world," able to distinguish all 800+ human language sounds. Parentese elongates vowel formants, allowing the brain to map native phonetic categories quickly.',
  },
]

export function LanguageMusic() {
  return (
    <section id="language-music">
      <SectionHeader
        module={3}
        title="Acoustic Scaffolding: Parentese & Musical Stimuli"
        description='Infant-directed speech ("Parentese") and rhythmic melody act as acoustic scaffolding for language processing and neuro-auditory mapping.'
      />
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <Text strong style={{ fontSize: 15 }}>Acoustic Architecture Comparison</Text>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Standard Adult Speech vs. Parentese Speech Profile</div>
              </div>
              <Tag color="magenta">Language Acquisition</Tag>
            </div>
            <ParenteseChart />
            <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-secondary)', background: 'var(--surface-subtle)', padding: 12, borderRadius: 8 }}>
              <strong>Note on Parentese:</strong> Parentese is <em>not</em> baby talk or nonsensical words. It uses
              real grammar and vocabulary spoken at a higher pitch, slower tempo, with exaggerated vowel sounds
              ("Heeellloo baby!").
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Row gutter={[0, 16]}>
            {cards.map((card) => (
              <Col xs={24} key={card.title}>
                <Card>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ color: card.color, background: card.bg, padding: 10, borderRadius: 12, fontSize: 18 }}>
                      {card.icon}
                    </span>
                    <div>
                      <Text strong>{card.title}</Text>
                      <Paragraph style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '4px 0 0' }}>{card.text}</Paragraph>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </section>
  )
}

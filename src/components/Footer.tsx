import { Typography } from 'antd'

const { Paragraph } = Typography

export function Footer() {
  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '40px 0', marginTop: 64, textAlign: 'center', fontSize: 12 }}>
      <div className="container">
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
          🧠 The Architecture of Early Development
        </div>
        <Paragraph style={{ color: '#94a3b8', maxWidth: 560, margin: '0 auto 16px' }}>
          Synthesized from peer-reviewed early infant psychology publications, Harvard Center on the Developing
          Child research, AAP guidelines, and contemporary developmental neuroscience.
        </Paragraph>
        <div style={{ color: '#64748b', paddingTop: 16, borderTop: '1px solid #1e293b' }}>
          Designed for Caregivers, Pediatric Educators, and Early Interventionists.
        </div>
      </div>
    </footer>
  )
}

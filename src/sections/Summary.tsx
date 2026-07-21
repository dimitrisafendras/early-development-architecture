import { Button, Card, Checkbox, Col, Row, Typography } from 'antd'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import { SectionHeader } from '../components/SectionHeader'
import { checklistItems } from '../data'
import { useAppStore } from '../store'

const { Text } = Typography

export function Summary() {
  const checkedItems = useAppStore((s) => s.checkedItems)
  const toggleItem = useAppStore((s) => s.toggleItem)
  const resetChecklist = useAppStore((s) => s.resetChecklist)

  return (
    <section id="summary">
      <SectionHeader
        module={7}
        title="💡 Summary of Key Action Items for Caregivers"
        description="Interactive master checklist to track your daily implementation of science-backed infant development practices."
      />
      <Card>
        <Row gutter={[16, 16]}>
          {checklistItems.map((item) => {
            const checked = checkedItems.includes(item.id)
            return (
              <Col xs={24} md={12} key={item.id}>
                <label
                  style={{
                    display: 'flex',
                    gap: 12,
                    padding: 16,
                    borderRadius: 12,
                    cursor: 'pointer',
                    background: checked ? 'rgba(16, 185, 129, 0.12)' : 'var(--surface-subtle)',
                    border: `1px solid ${checked ? '#34d399' : 'var(--border)'}`,
                    transition: 'all 0.2s',
                  }}
                >
                  <Checkbox
                    checked={checked}
                    onChange={(_: CheckboxChangeEvent) => toggleItem(item.id)}
                    style={{ marginTop: 2 }}
                  />
                  <div>
                    <Text strong style={{ display: 'block', marginBottom: 2 }}>{item.title}</Text>
                    <Text style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{item.desc}</Text>
                  </div>
                </label>
              </Col>
            )
          })}
        </Row>
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Progress:{' '}
            <Text strong style={{ color: '#0ea5e9' }}>{checkedItems.length}</Text> / {checklistItems.length} Completed
          </Text>
          <Button type="link" size="small" onClick={resetChecklist} style={{ color: '#94a3b8' }}>
            Reset Checklist
          </Button>
        </div>
      </Card>
    </section>
  )
}

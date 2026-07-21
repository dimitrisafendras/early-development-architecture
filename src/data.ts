import type { LatencyMode } from './store'

export const heroMetrics = [
  {
    label: 'Synaptogenesis',
    value: '1,000,000+',
    note: 'New neural connections per sec',
    color: '#fbbf24',
  },
  {
    label: 'Response Window',
    value: '1 – 4 Sec',
    note: 'Optimal contingent latency',
    color: '#38bdf8',
  },
  {
    label: 'Tummy Time Goal',
    value: '60 Mins',
    note: 'Daily target by 4 months',
    color: '#34d399',
  },
  {
    label: 'Parentese Effect',
    value: '2.5x',
    note: 'Sustained attention & recall',
    color: '#e879f9',
  },
]

export const serveReturnSteps = [
  {
    num: 1,
    title: 'Infant "Serve"',
    desc: 'Baby makes eye contact, babbles, reaches out, coos, or changes facial expression.',
    foot: 'Initiated by infant curiosity or need.',
    bg: '#f8fafc',
    border: '#e2e8f0',
    badge: '#0369a1',
  },
  {
    num: 2,
    title: '1–4 Sec Window',
    desc: 'Caregiver notices the signal and pauses adult task to direct full focus to the baby.',
    foot: '⏱️ Contingent timing is key!',
    bg: '#fffbeb',
    border: '#fde68a',
    badge: '#f59e0b',
  },
  {
    num: 3,
    title: 'Caregiver "Return"',
    desc: 'Respond with warm facial expression, vocal imitation, gentle touch, or word labeling.',
    foot: 'Validates infant agency & focus.',
    bg: '#f0f9ff',
    border: '#bae6fd',
    badge: '#0284c7',
  },
  {
    num: 4,
    title: 'Neural Fortification',
    desc: 'Synaptic circuits for trust, language, and emotional regulation lock into place.',
    foot: '✨ Circuit completed.',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    badge: '#059669',
  },
]

export const latencyOutcomes: Record<
  LatencyMode,
  { title: string; desc: string; color: string; buttonColor: string; buttonLabel: string }
> = {
  optimal: {
    title: 'High Contingency (1–4s)',
    desc: "The infant's prefrontal cortex connects the action with caregiver response. Synaptic strengthening is maximized, releasing oxytocin and stabilizing heart rate.",
    color: '#10b981',
    buttonColor: '#0284c7',
    buttonLabel: 'Fast Contingent (1–4 Seconds)',
  },
  delayed: {
    title: 'Moderate Latency (>10s)',
    desc: 'The infant loses the temporal association between their serve and the return. Attention drifts, and neural mapping efficiency drops by ~60%.',
    color: '#f59e0b',
    buttonColor: '#d97706',
    buttonLabel: 'Delayed Response (>10 Seconds)',
  },
  none: {
    title: 'Still Face / Non-Responsive',
    desc: 'Triggers an immediate cortisol spike in the baby. Repeated non-responsiveness causes the infant to withdraw, reducing overall vocalization attempts.',
    color: '#ef4444',
    buttonColor: '#dc2626',
    buttonLabel: 'Non-Responsive (Still Face)',
  },
}

export interface ScheduleBlock {
  time: string
  title: string
  items: { strong: string; text: string }[]
  focus: string
  color: string
  bg: string
  dark?: boolean
}

export const scheduleBlocks: ScheduleBlock[] = [
  {
    time: '06:00 – 08:30',
    title: 'Morning Awakening & Auditory Scaffolding',
    items: [
      { strong: 'Parentese Activation:', text: 'Speak in slow, warm, high-pitched tones during diaper changes & feedings.' },
      { strong: 'Contingent Eye Contact:', text: 'Respond swiftly (1–4s) to morning coos or gazes.' },
    ],
    focus: 'Focus: High linguistic input & emotional reconnect',
    color: '#b45309',
    bg: '#fffbeb',
  },
  {
    time: '09:00 – 11:30',
    title: 'Mid-Morning Physical & Cognitive Focus',
    items: [
      { strong: 'Targeted Tummy Time:', text: 'Place baby on firm play mat while fully awake & supervised.' },
      { strong: 'Face-to-Face Engagement:', text: 'Get down to eye level with high-contrast visual cards.' },
    ],
    focus: 'Focus: Core muscle building & visual scanning',
    color: '#047857',
    bg: '#ecfdf5',
  },
  {
    time: '12:00 – 14:30',
    title: 'Midday Reset, Sensory Regulation & Music',
    items: [
      { strong: 'Acoustic & Rhythmic Stimuli:', text: 'Play soft background lullabies or sing softly to regulate cortisol.' },
      { strong: 'Environmental Control:', text: 'Keep screens OFF and background noise minimal.' },
    ],
    focus: 'Focus: Sensory reset & nervous system calming',
    color: '#0369a1',
    bg: '#f0f9ff',
  },
  {
    time: '15:00 – 17:30',
    title: 'Afternoon Play & Dynamic Movement',
    items: [
      { strong: 'Secondary Tummy Session:', text: 'Short 5–10 min tummy intervals to avoid motor fatigue.' },
      { strong: 'Active Serve & Return:', text: 'Respond to leg kicks and babbling with warm touch & speech.' },
    ],
    focus: 'Focus: Dynamic mobility & tactile exploration',
    color: '#075985',
    bg: '#e0f2fe',
  },
  {
    time: '18:00 – 20:30',
    title: 'Evening Wind-Down & Acoustic Transition',
    items: [
      { strong: 'Calming Auditory Cues:', text: 'Transition to slow vocal tones and dim lighting.' },
      { strong: 'Caregiver Self-Care Buffer:', text: 'Rotate parenting duties to prevent caregiver burnout.' },
    ],
    focus: 'Focus: Melatonin onset & emotional grounding',
    color: '#a21caf',
    bg: '#fdf4ff',
  },
  {
    time: '21:00 Onward',
    title: 'Safe Nighttime Sleep & Memory Consolidation',
    items: [
      { strong: 'Back-to-Sleep Position:', text: 'Place baby strictly on their back on a firm, flat mattress.' },
      { strong: 'Neural Consolidation:', text: 'Deep slow-wave sleep converts daily synapses into long-term memory.' },
    ],
    focus: 'Focus: Airway safety & memory wiring',
    color: '#a5b4fc',
    bg: '#1e293b',
    dark: true,
  },
]

export const checklistItems = [
  {
    id: 'respond',
    title: 'Respond Swiftly (1–4s)',
    desc: 'Acknowledge vocalizations, gazes, and movements immediately to complete the Serve and Return loop.',
  },
  {
    id: 'parentese',
    title: 'Speak in Parentese Speech',
    desc: 'Use direct, slow-tempo, higher-pitched speech with elongated vowel sounds to boost phonetic processing.',
  },
  {
    id: 'tummy',
    title: 'Prioritize Daily Tummy Time',
    desc: 'Progressively build up to 60 cumulative minutes daily by 4 months while awake and supervised.',
  },
  {
    id: 'music',
    title: 'Introduce Soft Music & Rhythm',
    desc: 'Incorporate gentle singing and low-volume acoustic music to regulate stress and build auditory pathways.',
  },
  {
    id: 'screens',
    title: 'Limit Digital Screens & Background Noise',
    desc: "Eliminate screen exposure and background chatter to preserve the infant's attention span and focus metrics.",
  },
  {
    id: 'sleep',
    title: 'Maintain Safe Sleep Practices',
    desc: 'Always place infants strictly on their back on a flat, firm surface to protect airway and consolidate memory.',
  },
]

export const efficiencyScores = [
  { label: 'Live Human Interaction', value: 100, text: '100% Neural Activation', color: '#10b981' },
  { label: 'Interactive Audio / Live Singing', value: 85, text: '85% Neural Activation', color: '#f59e0b' },
  { label: '2D Video / Baby Media', value: 15, text: '<15% Neural Activation', color: '#f87171' },
]

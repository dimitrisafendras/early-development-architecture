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

/** Distinct per-phase accent hue. Rendered through soft, theme-aware tints. */
export type StepTone = 'slate' | 'amber' | 'sky' | 'emerald'

export interface ServeReturnStep {
  num: number
  title: string
  desc: string
  foot: string
  tone: StepTone
}

export const serveReturnSteps: ServeReturnStep[] = [
  {
    num: 1,
    title: 'Infant "Serve"',
    desc: 'Baby makes eye contact, babbles, reaches out, coos, or changes facial expression.',
    foot: 'Initiated by infant curiosity or need.',
    tone: 'slate',
  },
  {
    num: 2,
    title: '1–4 Sec Window',
    desc: 'Caregiver notices the signal and pauses adult task to direct full focus to the baby.',
    foot: '⏱️ Contingent timing is key!',
    tone: 'amber',
  },
  {
    num: 3,
    title: 'Caregiver "Return"',
    desc: 'Respond with warm facial expression, vocal imitation, gentle touch, or word labeling.',
    foot: 'Validates infant agency & focus.',
    tone: 'sky',
  },
  {
    num: 4,
    title: 'Neural Fortification',
    desc: 'Synaptic circuits for trust, language, and emotional regulation lock into place.',
    foot: '✨ Circuit completed.',
    tone: 'emerald',
  },
]

/** Response quality maps to a fixed status semantic (good / caution / harmful). */
export type StatusTone = 'success' | 'warning' | 'danger'

export const latencyOutcomes: Record<
  LatencyMode,
  { title: string; desc: string; tone: StatusTone; buttonLabel: string }
> = {
  optimal: {
    title: 'High Contingency (1–4s)',
    desc: "The infant's prefrontal cortex connects the action with caregiver response. Synaptic strengthening is maximized, releasing oxytocin and stabilizing heart rate.",
    tone: 'success',
    buttonLabel: 'Fast Contingent (1–4 Seconds)',
  },
  delayed: {
    title: 'Moderate Latency (>10s)',
    desc: 'The infant loses the temporal association between their serve and the return. Attention drifts, and neural mapping efficiency drops by ~60%.',
    tone: 'warning',
    buttonLabel: 'Delayed Response (>10 Seconds)',
  },
  none: {
    title: 'Still Face / Non-Responsive',
    desc: 'Triggers an immediate cortisol spike in the baby. Repeated non-responsiveness causes the infant to withdraw, reducing overall vocalization attempts.',
    tone: 'danger',
    buttonLabel: 'Non-Responsive (Still Face)',
  },
}

/** Each schedule block keeps a distinct hue; rendered as soft, theme-aware tints. */
export type ScheduleTone = 'amber' | 'emerald' | 'sky' | 'cyan' | 'fuchsia' | 'indigo'

export interface ScheduleBlock {
  time: string
  title: string
  items: { strong: string; text: string }[]
  focus: string
  tone: ScheduleTone
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
    tone: 'amber',
  },
  {
    time: '09:00 – 11:30',
    title: 'Mid-Morning Physical & Cognitive Focus',
    items: [
      { strong: 'Targeted Tummy Time:', text: 'Place baby on firm play mat while fully awake & supervised.' },
      { strong: 'Face-to-Face Engagement:', text: 'Get down to eye level with high-contrast visual cards.' },
    ],
    focus: 'Focus: Core muscle building & visual scanning',
    tone: 'emerald',
  },
  {
    time: '12:00 – 14:30',
    title: 'Midday Reset, Sensory Regulation & Music',
    items: [
      { strong: 'Acoustic & Rhythmic Stimuli:', text: 'Play soft background lullabies or sing softly to regulate cortisol.' },
      { strong: 'Environmental Control:', text: 'Keep screens OFF and background noise minimal.' },
    ],
    focus: 'Focus: Sensory reset & nervous system calming',
    tone: 'sky',
  },
  {
    time: '15:00 – 17:30',
    title: 'Afternoon Play & Dynamic Movement',
    items: [
      { strong: 'Secondary Tummy Session:', text: 'Short 5–10 min tummy intervals to avoid motor fatigue.' },
      { strong: 'Active Serve & Return:', text: 'Respond to leg kicks and babbling with warm touch & speech.' },
    ],
    focus: 'Focus: Dynamic mobility & tactile exploration',
    tone: 'cyan',
  },
  {
    time: '18:00 – 20:30',
    title: 'Evening Wind-Down & Acoustic Transition',
    items: [
      { strong: 'Calming Auditory Cues:', text: 'Transition to slow vocal tones and dim lighting.' },
      { strong: 'Caregiver Self-Care Buffer:', text: 'Rotate parenting duties to prevent caregiver burnout.' },
    ],
    focus: 'Focus: Melatonin onset & emotional grounding',
    tone: 'fuchsia',
  },
  {
    time: '21:00 Onward',
    title: 'Safe Nighttime Sleep & Memory Consolidation',
    items: [
      { strong: 'Back-to-Sleep Position:', text: 'Place baby strictly on their back on a firm, flat mattress.' },
      { strong: 'Neural Consolidation:', text: 'Deep slow-wave sleep converts daily synapses into long-term memory.' },
    ],
    focus: 'Focus: Airway safety & memory wiring',
    tone: 'indigo',
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

export const efficiencyScores: {
  label: string
  value: number
  text: string
  tone: StatusTone
}[] = [
  { label: 'Live Human Interaction', value: 100, text: '100% Neural Activation', tone: 'success' },
  { label: 'Interactive Audio / Live Singing', value: 85, text: '85% Neural Activation', tone: 'warning' },
  { label: '2D Video / Baby Media', value: 15, text: '<15% Neural Activation', tone: 'danger' },
]

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

/* ------------------------------------------------------------ interaction */

/** "How much" daily-dose stat tiles. Values are locale-independent; the
 *  label + unit + note are localized in i18n (`interaction.stats`). */
export const interactionStats: { value: string; color: string }[] = [
  { value: '21,000', color: '#38bdf8' }, // words/day heard
  { value: '15+', color: '#34d399' }, //    minutes reading/day
  { value: '2–3', color: '#fbbf24' }, //    tummy sessions/day
  { value: '1–4', color: '#e879f9' }, //    second response window
]

/** Age-banded awake windows; text (age / window / play) localized in i18n. */
export const awakeWindows: { tone: ScheduleTone }[] = [
  { tone: 'amber' }, // 0–1 mo
  { tone: 'emerald' }, // 1–3 mo
  { tone: 'sky' }, // 3–4 mo
  { tone: 'fuchsia' }, // 4–6 mo
]
/** Exclusive upper age bound (months) per awake-window band; last is open-ended. */
export const awakeWindowUppers = [1, 3, 4, 999]

/** "How" method cards; title/text localized in i18n (`interaction.how`). */
export const interactionHow: { tone: StatusTone }[] = [
  { tone: 'success' }, // serve & return
  { tone: 'success' }, // parentese narration
  { tone: 'success' }, // read & sing
  { tone: 'success' }, // face-to-face
  { tone: 'warning' }, // follow the baby's lead
  { tone: 'danger' }, //  keep it screen-free
]

/* --------------------------------------------------------- sleep & feeding */

/** Sleep "at a glance" tiles; label/note localized in i18n. */
export const sleepStats: { value: string; color: string }[] = [
  { value: '14–17h', color: '#818cf8' }, // 0–3 mo total / 24h
  { value: '12–16h', color: '#34d399' }, // 4–12 mo total / 24h
  { value: '2–3', color: '#fbbf24' }, //    naps/day at 4–6 mo
  { value: '1 yr', color: '#38bdf8' }, //   back-to-sleep until
]

/** Safe-sleep rules; title/text localized in i18n. tone drives the accent. */
export const safeSleepRules: { tone: StatusTone }[] = [
  { tone: 'success' }, // back to sleep
  { tone: 'success' }, // firm flat surface, own space
  { tone: 'success' }, // room-share 6–12 mo
  { tone: 'danger' }, //  no soft bedding / bumpers / toys
]

/** Feeding frequency/amount rows by age band; all text localized in i18n.
 *  `feedsPerDay` is the typical [min, max] number of feeds/24h for the band —
 *  used to compare today's logged count against age guidance (a guide, not a
 *  target). Monotonic-decreasing and consistent with the i18n frequency text. */
export const feedingRows: { tone: ScheduleTone; feedsPerDay: [number, number] }[] = [
  { tone: 'amber', feedsPerDay: [8, 12] }, // newborn 0–1 mo
  { tone: 'emerald', feedsPerDay: [7, 9] }, // 1–2 mo
  { tone: 'sky', feedsPerDay: [6, 8] }, // 2–4 mo
  { tone: 'fuchsia', feedsPerDay: [4, 5] }, // 4–6 mo
]
/** Exclusive upper age bound (months) per feeding band; last is open-ended. */
export const feedingUppers = [1, 2, 4, 999]

/* ------------------------------------------------------------- full day */

/** Activity kinds on the hour-by-hour full-day schedule. Drives colour + icon
 *  + the legend; the slot text is localized in i18n (`fullDay.slots`). */
export type DayActivity = 'feed' | 'sleep' | 'play' | 'tummy' | 'care' | 'wind'

/** A realistic ~3–4-month sample day, in order. Time is locale-independent;
 *  each entry's title/detail live in i18n at the same index. */
export const fullDaySchedule: { time: string; type: DayActivity }[] = [
  { time: '07:00', type: 'feed' },
  { time: '07:40', type: 'care' },
  { time: '08:00', type: 'play' },
  { time: '08:30', type: 'tummy' },
  { time: '09:00', type: 'sleep' },
  { time: '10:15', type: 'feed' },
  { time: '10:45', type: 'play' },
  { time: '11:30', type: 'tummy' },
  { time: '12:00', type: 'sleep' },
  { time: '13:30', type: 'feed' },
  { time: '14:00', type: 'play' },
  { time: '15:15', type: 'sleep' },
  { time: '16:15', type: 'feed' },
  { time: '16:45', type: 'play' },
  { time: '17:30', type: 'tummy' },
  { time: '18:00', type: 'care' },
  { time: '18:45', type: 'wind' },
  { time: '19:00', type: 'feed' },
  { time: '19:30', type: 'sleep' },
  { time: '23:00', type: 'feed' },
  { time: '03:00', type: 'feed' },
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

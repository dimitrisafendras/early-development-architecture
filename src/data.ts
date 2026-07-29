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
    label: 'Movement Target',
    value: '180 Mins',
    note: '180 min/day from age 1 (WHO)',
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

/** Today's caregiver checklist. `minMonths`/`maxMonths` gate an item to an age
 *  window (exclusive upper bound) — a two-year-old is not owed 60 minutes of
 *  tummy time, and a newborn is not owed 180 minutes of running about. Items
 *  keep their position in this array for ever: the localized text in
 *  `summary.items` is matched by index, so new items are appended, never
 *  inserted (see {@link checklistItemsForAge}). */
export const checklistItems: {
  id: string
  title: string
  desc: string
  minMonths?: number
  maxMonths?: number
}[] = [
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
    maxMonths: 12,
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
  // Appended for the 1–3 year range. Never reorder this array — the localized
  // text is index-matched.
  {
    id: 'movement',
    title: 'Reach 180 Minutes of Movement',
    desc: 'Walking, climbing, dancing, playground time — any intensity, in any number of bursts, across the whole day.',
    minMonths: 12,
  },
  {
    id: 'mealtogether',
    title: 'Eat at Least One Meal Together',
    desc: 'Same food, same table, no screens. Children learn to eat, talk and take turns by watching you do it.',
    minMonths: 12,
  },
  {
    id: 'feelings',
    title: 'Name the Feelings Out Loud',
    desc: 'Put words to the frustration before it peaks, and offer two real choices. Language is what makes a tantrum shorter.',
    minMonths: 15,
  },
]

/** The checklist for a child of `months`, each item paired with its permanent
 *  index into {@link checklistItems} so the index-matched i18n text still lines
 *  up after filtering. `null` (no baby on file) shows the birth-to-6-month set. */
export function checklistItemsForAge(
  months: number | null,
): { item: (typeof checklistItems)[number]; index: number }[] {
  const age = months ?? 0
  return checklistItems
    .map((item, index) => ({ item, index }))
    .filter(
      ({ item }) =>
        (item.minMonths == null || age >= item.minMonths) &&
        (item.maxMonths == null || age < item.maxMonths),
    )
}

/* ------------------------------------------------------------ interaction */

/** "How much" daily-dose stat tiles. Values are locale-independent; the
 *  label + unit + note are localized in i18n (`interaction.stats`). */
export const interactionStats: { value: string; color: string }[] = [
  { value: '21,000', color: '#38bdf8' }, // words/day heard
  { value: '15+', color: '#34d399' }, //    minutes reading/day
  { value: '2–3', color: '#fbbf24' }, //    tummy sessions/day
  { value: '1–4', color: '#e879f9' }, //    second response window
]

/** Age-banded awake windows, birth to three years; text (age / window / play)
 *  localized in i18n. */
export const awakeWindows: { tone: ScheduleTone }[] = [
  { tone: 'amber' }, // 0–1 mo
  { tone: 'emerald' }, // 1–3 mo
  { tone: 'sky' }, // 3–6 mo
  { tone: 'cyan' }, // 6–12 mo
  { tone: 'fuchsia' }, // 12–18 mo
  { tone: 'indigo' }, // 18–24 mo
  { tone: 'amber' }, // 2–3 y
]
/** Exclusive upper age bound (months) per awake-window band; last is open-ended. */
export const awakeWindowUppers = [1, 3, 6, 12, 18, 24, 999]

/** Screen-media guidance per age band (AAP + WHO). `maxMins` is the daily
 *  ceiling: 0 = none recommended, and the text in i18n carries the nuance
 *  (video chat is exempt; 18–24 mo only with an adult watching along). */
export const screenBands: { tone: StatusTone; maxMins: number }[] = [
  { tone: 'danger', maxMins: 0 }, // 0–18 mo — none (video chat aside)
  { tone: 'warning', maxMins: 0 }, // 18–24 mo — only co-viewed, no solo screens
  { tone: 'warning', maxMins: 60 }, // 2–3 y — up to 1 h of high-quality, co-viewed
]
/** Exclusive upper age bound (months) per screen band; last is open-ended. */
export const screenUppers = [18, 24, 999]

/** Ground rules for the solo half of an awake window; text in i18n
 *  (`interaction.soloRules`). The engaged/solo split itself is age-banded text
 *  on `interaction.solo`, sharing the bands and tones of {@link awakeWindows}. */
export const interactionSoloRules: { tone: StatusTone }[] = [
  { tone: 'success' }, // solo still means supervised
  { tone: 'warning' }, // answer cues that escalate
  { tone: 'success' }, // sleep is its own thing, not solo play
  { tone: 'danger' }, //  never alone on a raised surface
]

/** "How" method cards; title/text localized in i18n (`interaction.how`). */
export const interactionHow: { tone: StatusTone }[] = [
  { tone: 'success' }, // serve & return
  { tone: 'success' }, // parentese narration
  { tone: 'success' }, // read & sing
  { tone: 'success' }, // face-to-face
  { tone: 'warning' }, // follow the baby's lead
  { tone: 'danger' }, //  keep it screen-free
]

/* ---------------------------------------------------------------- milestones */

/** The four domains a CDC milestone checklist is grouped by. */
export type MilestoneDomain = 'social' | 'language' | 'cognitive' | 'motor'

export const milestoneDomainOrder: MilestoneDomain[] = ['social', 'language', 'cognitive', 'motor']

/**
 * The CDC "Learn the Signs. Act Early." checkpoints, which are also the ages of
 * the recommended well-child developmental screenings. A milestone here is what
 * **75% or more** of children can do by that age (the 2022 revision's criterion),
 * so a missing one is a reason to ask — never a percentile or a pass mark.
 *
 * Text lives in i18n (`milestones.bands`) at the matching index.
 */
export const milestoneBands: { tone: ScheduleTone }[] = [
  { tone: 'amber' }, //   2 mo
  { tone: 'emerald' }, // 4 mo
  { tone: 'sky' }, //     6 mo
  { tone: 'cyan' }, //    9 mo
  { tone: 'fuchsia' }, // 12 mo
  { tone: 'indigo' }, //  15 mo
  { tone: 'amber' }, //   18 mo
  { tone: 'emerald' }, // 24 mo
  { tone: 'sky' }, //     30 mo
  { tone: 'cyan' }, //    36 mo
]

/** Exclusive upper age bound (months) per checkpoint; last is open-ended. A baby
 *  of 3 months therefore sits on the "by 4 months" list — the next thing to
 *  watch for, which is what a caregiver wants, rather than the one just passed. */
export const milestoneUppers = [2, 4, 6, 9, 12, 15, 18, 24, 30, 999]

/* --------------------------------------------------------- sleep & feeding */

/** Sleep "at a glance" tiles; label/note localized in i18n. The three totals are
 *  the AASM bands the AAP endorses; the fourth is the safe-sleep boundary. */
export const sleepStats: { value: string; color: string }[] = [
  { value: '14–17h', color: '#818cf8' }, // 0–3 mo total / 24h
  { value: '12–16h', color: '#34d399' }, // 4–12 mo total / 24h
  { value: '11–14h', color: '#fbbf24' }, // 1–2 y total / 24h
  { value: '10–13h', color: '#e879f9' }, // 3 y total / 24h
  { value: '1 yr', color: '#38bdf8' }, //   back-to-sleep until
]

/** How the naps themselves change, band by band; text localized in i18n
 *  (`sleep.naps`). Highlighted against the baby's age like every other band. */
export const napBands: { tone: ScheduleTone }[] = [
  { tone: 'amber' }, // 0–3 mo — no fixed pattern
  { tone: 'emerald' }, // 3–6 mo — 3 naps
  { tone: 'sky' }, // 6–12 mo — 2–3 naps
  { tone: 'cyan' }, // 12–18 mo — 2 naps to 1
  { tone: 'fuchsia' }, // 18–24 mo — 1 nap
  { tone: 'indigo' }, // 2–3 y — 1 nap or quiet time
]
/** Exclusive upper age bound (months) per nap band; last is open-ended. */
export const napUppers = [3, 6, 12, 18, 24, 999]

/** Safe-sleep rules; title/text localized in i18n. tone drives the accent. */
export const safeSleepRules: { tone: StatusTone }[] = [
  { tone: 'success' }, // back to sleep
  { tone: 'success' }, // firm flat surface, own space
  { tone: 'success' }, // room-share 6–12 mo
  { tone: 'danger' }, //  no soft bedding / bumpers / toys
  { tone: 'warning' }, // cot to bed at 2–3 y, when they can climb out
]

/** Feeding frequency/amount rows by age band; all text localized in i18n.
 *  `feedsPerDay` is the typical [min, max] number of feeds/24h for the band —
 *  used to compare today's logged count against age guidance (a guide, not a
 *  target). Monotonic-decreasing and consistent with the i18n frequency text. */
export const feedingRows: { tone: ScheduleTone; feedsPerDay: [number, number] }[] = [
  { tone: 'amber', feedsPerDay: [8, 12] }, // newborn 0–1 mo
  { tone: 'emerald', feedsPerDay: [7, 9] }, // 1–2 mo
  { tone: 'sky', feedsPerDay: [6, 8] }, // 2–4 mo
  { tone: 'fuchsia', feedsPerDay: [4, 6] }, // 4–6 mo — milk only, solids not yet
  { tone: 'cyan', feedsPerDay: [4, 5] }, // 6–9 mo — milk + 2–3 solid meals
  { tone: 'indigo', feedsPerDay: [3, 4] }, // 9–12 mo — milk + 3 meals + a snack
  { tone: 'amber', feedsPerDay: [2, 3] }, // 12–24 mo — cup milk beside 3 meals + 2 snacks
  { tone: 'emerald', feedsPerDay: [2, 3] }, // 2–3 y — same shape, bigger portions
]
/** Exclusive upper age bound (months) per feeding band; last is open-ended.
 *  From 6 months the count is *milk* feeds only — the solid meals sit beside it
 *  and are described in the band's i18n text. */
export const feedingUppers = [1, 2, 4, 6, 9, 12, 24, 999]

/* ------------------------------------------------------------- full day */

/** Activity kinds on the hour-by-hour full-day schedule. Drives colour + icon
 *  + the legend; the slot text is localized in i18n (`fullDay.days`).
 *  `feed` is milk (breast/bottle/cup) and `meal` is solid food — one kind could
 *  not carry both once the app covered 6 months to 3 years, where a day holds
 *  three meals *and* a milk drink. */
export type DayActivity = 'feed' | 'meal' | 'sleep' | 'play' | 'tummy' | 'care' | 'wind'

/** A fully-resolved schedule slot (when it starts, how long it takes, and its
 *  own text). The built-in {@link fullDaySchedule} pairs with localized text in
 *  i18n by index; a user-customized schedule (edited on /schedule) stores its
 *  text inline.
 *
 *  `mins` is the slot's own length, not the gap to the next slot: a 07:00 feed
 *  takes ~25 min even when the next thing on the list is at 07:40. Everything
 *  that draws progress or a countdown reads `mins`, so the two are never
 *  conflated (they used to be — a feed appeared to last 40 minutes). */
export interface ScheduleSlot {
  time: string
  type: DayActivity
  /** How long the activity itself takes, in whole minutes. */
  mins: number
  title: string
  detail: string
}

/** Typical length per activity kind, used for a slot the caregiver has just
 *  added on /schedule and to backfill a customized schedule saved before slots
 *  carried a duration. Same evidence base as {@link fullDaySchedule}. */
export const defaultSlotMins: Record<DayActivity, number> = {
  feed: 25,
  meal: 30,
  sleep: 75,
  play: 30,
  tummy: 10,
  care: 20,
  wind: 15,
}

/** The age bands the sample days are written for. `id` keys the localized text
 *  in `fullDay.days` / `fullDay.dayLabels`; `upperMonths` is the exclusive upper
 *  bound (the last band is open-ended). */
export type DayTemplateId = 'newborn' | 'infant' | 'older' | 'oneNap' | 'toddler'

export interface DayTemplate {
  id: DayTemplateId
  /** Exclusive upper age bound in months; `999` = open-ended. */
  upperMonths: number
  slots: { time: string; type: DayActivity; mins: number }[]
}

/**
 * One realistic sample day per age band, birth to three years, each in order.
 * Times are locale-independent; every slot's title/detail live in i18n under
 * `fullDay.days[id]` at the same index.
 *
 * Durations are the typical middles of the published ranges for the band, never
 * targets (see `fullDay.sourcesLabel`). The invariants each day is built to:
 * - **total sleep** inside the AASM/AAP band for the age — 14–17 h at 0–3 mo,
 *   12–16 h at 4–12 mo, 11–14 h at 1–2 y, 10–13 h at 3 y;
 * - **wake windows** inside the age's tolerance — 45–60 min for a newborn,
 *   75–120 min at 3–4 mo, 2.5–3.5 h at 6–12 mo, 4–6 h on one nap, 5–6 h at 2–3 y;
 * - **feeds** 8–12 milk feeds a day at 0–1 mo thinning to ~4 by a year, then
 *   3 meals + 2 snacks with ~470–710 ml of milk a day through 1–3 y;
 * - **movement** tummy time 5–10 min a session while pre-mobile, then floor and
 *   active play adding up to the WHO 180 min a day from the first birthday.
 */
export const dayTemplates: DayTemplate[] = [
  {
    id: 'newborn',
    upperMonths: 3,
    slots: [
      { time: '07:00', type: 'feed', mins: 30 },
      { time: '07:35', type: 'care', mins: 15 },
      { time: '07:55', type: 'play', mins: 15 },
      { time: '08:10', type: 'tummy', mins: 3 },
      { time: '08:20', type: 'sleep', mins: 90 },
      { time: '09:50', type: 'feed', mins: 30 },
      { time: '10:25', type: 'play', mins: 20 },
      { time: '10:50', type: 'sleep', mins: 90 },
      { time: '12:20', type: 'feed', mins: 30 },
      { time: '12:55', type: 'tummy', mins: 3 },
      { time: '13:05', type: 'play', mins: 15 },
      { time: '13:25', type: 'sleep', mins: 100 },
      { time: '15:05', type: 'feed', mins: 30 },
      { time: '15:40', type: 'play', mins: 20 },
      { time: '16:05', type: 'sleep', mins: 75 },
      { time: '17:20', type: 'feed', mins: 30 },
      { time: '17:55', type: 'care', mins: 20 },
      { time: '18:20', type: 'wind', mins: 20 },
      { time: '18:45', type: 'feed', mins: 30 },
      { time: '19:20', type: 'sleep', mins: 180 },
      { time: '22:30', type: 'feed', mins: 25 },
      { time: '01:30', type: 'feed', mins: 25 },
      { time: '04:30', type: 'feed', mins: 25 },
    ],
  },
  {
    id: 'infant',
    upperMonths: 6,
    slots: [
      { time: '07:00', type: 'feed', mins: 25 },
      { time: '07:40', type: 'care', mins: 20 },
      { time: '08:00', type: 'play', mins: 30 },
      { time: '08:30', type: 'tummy', mins: 10 },
      { time: '09:00', type: 'sleep', mins: 75 },
      { time: '10:15', type: 'feed', mins: 25 },
      { time: '10:45', type: 'play', mins: 35 },
      { time: '11:30', type: 'tummy', mins: 10 },
      { time: '12:00', type: 'sleep', mins: 90 },
      { time: '13:30', type: 'feed', mins: 25 },
      { time: '14:00', type: 'play', mins: 60 },
      { time: '15:15', type: 'sleep', mins: 45 },
      { time: '16:15', type: 'feed', mins: 25 },
      { time: '16:45', type: 'play', mins: 40 },
      { time: '17:30', type: 'tummy', mins: 5 },
      { time: '18:00', type: 'care', mins: 30 },
      { time: '18:45', type: 'wind', mins: 15 },
      { time: '19:00', type: 'feed', mins: 25 },
      { time: '19:30', type: 'sleep', mins: 210 },
      { time: '23:00', type: 'feed', mins: 20 },
      { time: '03:00', type: 'feed', mins: 15 },
    ],
  },
  {
    id: 'older',
    upperMonths: 12,
    slots: [
      { time: '07:00', type: 'feed', mins: 20 },
      { time: '07:30', type: 'meal', mins: 25 },
      { time: '08:00', type: 'care', mins: 15 },
      { time: '08:20', type: 'play', mins: 40 },
      { time: '09:00', type: 'tummy', mins: 15 },
      { time: '09:30', type: 'sleep', mins: 60 },
      { time: '10:30', type: 'feed', mins: 20 },
      { time: '11:00', type: 'play', mins: 45 },
      { time: '11:45', type: 'meal', mins: 30 },
      { time: '12:30', type: 'sleep', mins: 90 },
      { time: '14:00', type: 'feed', mins: 20 },
      { time: '14:30', type: 'play', mins: 60 },
      { time: '15:45', type: 'sleep', mins: 30 },
      { time: '16:15', type: 'meal', mins: 20 },
      { time: '16:45', type: 'play', mins: 45 },
      { time: '17:30', type: 'meal', mins: 30 },
      { time: '18:05', type: 'care', mins: 25 },
      { time: '18:35', type: 'wind', mins: 15 },
      { time: '18:50', type: 'feed', mins: 20 },
      { time: '19:15', type: 'sleep', mins: 660 },
    ],
  },
  {
    id: 'oneNap',
    upperMonths: 24,
    slots: [
      { time: '07:00', type: 'meal', mins: 30 },
      { time: '07:45', type: 'care', mins: 15 },
      { time: '08:15', type: 'play', mins: 75 },
      { time: '09:45', type: 'meal', mins: 15 },
      { time: '10:15', type: 'play', mins: 90 },
      { time: '11:45', type: 'meal', mins: 30 },
      { time: '12:30', type: 'sleep', mins: 120 },
      { time: '14:30', type: 'meal', mins: 15 },
      { time: '15:00', type: 'play', mins: 90 },
      { time: '16:45', type: 'play', mins: 30 },
      { time: '17:30', type: 'meal', mins: 30 },
      { time: '18:15', type: 'care', mins: 25 },
      { time: '18:45', type: 'wind', mins: 20 },
      { time: '19:15', type: 'sleep', mins: 690 },
    ],
  },
  {
    id: 'toddler',
    upperMonths: 999,
    slots: [
      { time: '07:00', type: 'meal', mins: 30 },
      { time: '07:45', type: 'care', mins: 20 },
      { time: '08:15', type: 'play', mins: 90 },
      { time: '09:45', type: 'meal', mins: 15 },
      { time: '10:15', type: 'play', mins: 105 },
      { time: '12:00', type: 'meal', mins: 35 },
      { time: '12:45', type: 'sleep', mins: 90 },
      { time: '14:30', type: 'meal', mins: 15 },
      { time: '15:00', type: 'play', mins: 120 },
      { time: '17:00', type: 'play', mins: 30 },
      { time: '17:45', type: 'meal', mins: 35 },
      { time: '18:30', type: 'care', mins: 25 },
      { time: '19:00', type: 'wind', mins: 25 },
      { time: '19:30', type: 'sleep', mins: 660 },
    ],
  },
]

/** The template for an age in months (the app's default when there's no baby on
 *  file is the 3–6 month day, which is where a recognisable clock first appears). */
export function dayTemplateForAge(months: number | null): DayTemplate {
  if (months == null) return dayTemplates[1]
  return dayTemplates.find((d) => months < d.upperMonths) ?? dayTemplates[dayTemplates.length - 1]
}

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

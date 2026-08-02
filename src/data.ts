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

export interface ServeReturnStep {
  num: number
  title: string
  desc: string
  foot: string
}

export const serveReturnSteps: ServeReturnStep[] = [
  {
    num: 1,
    title: 'Infant "Serve"',
    desc: 'Baby makes eye contact, babbles, reaches out, coos, or changes facial expression.',
    foot: 'Initiated by infant curiosity or need.',
  },
  {
    num: 2,
    title: '1–4 Sec Window',
    desc: 'Caregiver notices the signal and pauses adult task to direct full focus to the baby.',
    foot: '⏱️ Contingent timing is key!',
  },
  {
    num: 3,
    title: 'Caregiver "Return"',
    desc: 'Respond with warm facial expression, vocal imitation, gentle touch, or word labeling.',
    foot: 'Validates infant agency & focus.',
  },
  {
    num: 4,
    title: 'Neural Fortification',
    desc: 'Synaptic circuits for trust, language, and emotional regulation lock into place.',
    foot: '✨ Circuit completed.',
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

export interface ScheduleBlock {
  time: string
  title: string
  items: { strong: string; text: string }[]
  focus: string
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
  },
  {
    time: '09:00 – 11:30',
    title: 'Mid-Morning Physical & Cognitive Focus',
    items: [
      { strong: 'Targeted Tummy Time:', text: 'Place baby on firm play mat while fully awake & supervised.' },
      { strong: 'Face-to-Face Engagement:', text: 'Get down to eye level with high-contrast visual cards.' },
    ],
    focus: 'Focus: Core muscle building & visual scanning',
  },
  {
    time: '12:00 – 14:30',
    title: 'Midday Reset, Sensory Regulation & Music',
    items: [
      { strong: 'Acoustic & Rhythmic Stimuli:', text: 'Play soft background lullabies or sing softly to regulate cortisol.' },
      { strong: 'Environmental Control:', text: 'Keep screens OFF and background noise minimal.' },
    ],
    focus: 'Focus: Sensory reset & nervous system calming',
  },
  {
    time: '15:00 – 17:30',
    title: 'Afternoon Play & Dynamic Movement',
    items: [
      { strong: 'Secondary Tummy Session:', text: 'Short 5–10 min tummy intervals to avoid motor fatigue.' },
      { strong: 'Active Serve & Return:', text: 'Respond to leg kicks and babbling with warm touch & speech.' },
    ],
    focus: 'Focus: Dynamic mobility & tactile exploration',
  },
  {
    time: '18:00 – 20:30',
    title: 'Evening Wind-Down & Acoustic Transition',
    items: [
      { strong: 'Calming Auditory Cues:', text: 'Transition to slow vocal tones and dim lighting.' },
      { strong: 'Caregiver Self-Care Buffer:', text: 'Rotate parenting duties to prevent caregiver burnout.' },
    ],
    focus: 'Focus: Melatonin onset & emotional grounding',
  },
  {
    time: '21:00 Onward',
    title: 'Safe Nighttime Sleep & Memory Consolidation',
    items: [
      { strong: 'Back-to-Sleep Position:', text: 'Place baby strictly on their back on a firm, flat mattress.' },
      { strong: 'Neural Consolidation:', text: 'Deep slow-wave sleep converts daily synapses into long-term memory.' },
    ],
    focus: 'Focus: Airway safety & memory wiring',
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
export const feedingRows: { feedsPerDay: [number, number] }[] = [
  { feedsPerDay: [8, 12] }, // newborn 0–1 mo
  { feedsPerDay: [7, 9] }, // 1–2 mo
  { feedsPerDay: [6, 8] }, // 2–4 mo
  { feedsPerDay: [4, 6] }, // 4–6 mo — milk only, solids not yet
  { feedsPerDay: [4, 5] }, // 6–9 mo — milk + 2–3 solid meals
  { feedsPerDay: [3, 4] }, // 9–12 mo — milk + 3 meals + a snack
  { feedsPerDay: [2, 3] }, // 12–24 mo — cup milk beside 3 meals + 2 snacks
  { feedsPerDay: [2, 3] }, // 2–3 y — same shape, bigger portions
]
/** Exclusive upper age bound (months) per feeding band; last is open-ended.
 *  From 6 months the count is *milk* feeds only — the solid meals sit beside it
 *  and are described in the band's i18n text. */
export const feedingUppers = [1, 2, 4, 6, 9, 12, 24, 999]

/* ------------------------------------------------------------- full day */

/** Activity kinds on the hour-by-hour full-day schedule. Drives colour + icon
 *  + the legend; the slot text is localized in i18n (`fullDay.moments`).
 *  `feed` is milk (breast/bottle/cup) and `meal` is solid food — one kind could
 *  not carry both once the app covered 6 months to 3 years, where a day holds
 *  three meals *and* a milk drink. */
export type DayActivity =
  | 'feed'
  | 'meal'
  | 'sleep'
  | 'play'
  | 'tummy'
  | 'care'
  | 'wind'
  /** Gross-motor play once the child is mobile — the WHO's 180 min a day of
   *  movement from the first birthday. Distinct from `play` (serve-and-return,
   *  quiet connection) and from `tummy` (floor time for a pre-mobile baby), and
   *  it is what the tracker logs against once tummy time stops being the thing
   *  being built. Appears from the 9–12 month day onward, where crawling and
   *  cruising start — not from the first birthday, which is when the WHO target
   *  applies but well after the movement itself begins. */
  | 'active'

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
  /**
   * The i18n moment this slot's words come from, when the app wrote them.
   *
   * `title` and `detail` are stored as *text*, which is right for "Dad's turn"
   * and wrong for "Long midday sleep": a saved program keeps whatever language
   * it was created in, so switching the app to Greek left the day — the app's
   * landing screen — reading in English for ever. With the key kept, app-written
   * moments resolve through i18n on every read and follow the language.
   *
   * Cleared the moment the caregiver renames the row: from then on the words are
   * theirs, and re-deriving them from a key would overwrite what they typed.
   */
  moment?: MomentKey
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
  active: 45,
}

/** The age bands the sample days are written for. `id` keys the localized label
 *  in `fullDay.dayLabels`; `upperMonths` is the exclusive upper bound (the last
 *  band is open-ended).
 *
 *  Nine bands, not five. The old set lumped a 3-month-old (four naps, no solids)
 *  with a 5-month-old, and a 6-month-old with an 11-month-old who has dropped to
 *  two naps and eats three meals — so the "sample day for your age" was wrong for
 *  half of each band it covered. The boundaries below are the ages at which the
 *  day actually changes shape: a nap is dropped, solids start, or the wake window
 *  crosses into the next published range. */
export type DayTemplateId =
  | 'newborn'
  | 'settling'
  | 'threeNaps'
  | 'solids'
  | 'twoNaps'
  | 'napTransition'
  | 'oneNap'
  | 'toddler'
  | 'preschool'

/**
 * A named moment in a sample day. The key resolves to `{ title, detail }` in
 * i18n under `fullDay.moments`.
 *
 * Text used to be an array in i18n paired with the slot array in this file **by
 * index** — so inserting one slot here silently shifted every title below it
 * onto the wrong moment, and a length mismatch threw at render. Naming the
 * moment makes the pairing checkable by the compiler (`Record<MomentKey, …>`)
 * and lets nine days share one vocabulary instead of restating "Nappy & dress"
 * nine times in two locales.
 */
export type MomentKey =
  // Milk feeds
  | 'feedWake'
  | 'feedOnWaking'
  | 'feedMidday'
  | 'feedAfternoon'
  | 'feedEvening'
  | 'feedBedtime'
  | 'feedNight'
  | 'feedEarlyHours'
  // Solid meals
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snackMorning'
  | 'snackAfternoon'
  // Sleep
  | 'napFirst'
  | 'napSecond'
  | 'napThird'
  | 'napCatnap'
  | 'napLong'
  | 'napShortMorning'
  | 'napOne'
  | 'napQuiet'
  | 'nightSleep'
  | 'nightSleepAgain'
  // Play, tummy time and gross-motor play
  | 'faceToFace'
  | 'quietPlay'
  | 'cuddleChat'
  | 'heldAwake'
  | 'floorPlay'
  | 'booksSinging'
  | 'outing'
  | 'calmPlay'
  | 'tummyFirst'
  | 'tummySecond'
  | 'tummyThird'
  | 'activeMorning'
  | 'activeMidMorning'
  | 'activeAfternoon'
  // Care and wind-down
  | 'nappyDress'
  | 'bathTopTail'
  | 'bath'
  | 'teethPyjamas'
  | 'windDownNap'
  | 'windDownNight'

export interface DayTemplate {
  id: DayTemplateId
  /** Exclusive upper age bound in months; `999` = open-ended. */
  upperMonths: number
  slots: { time: string; type: DayActivity; mins: number; moment: MomentKey }[]
}

/**
 * One realistic sample day per age band, birth to three years and beyond, each
 * in clock order. Times and durations are locale-independent; each slot's text
 * is looked up by its `moment` key in i18n under `fullDay.moments`.
 *
 * Durations are the typical middles of the published ranges for the band, never
 * targets (see `fullDay.sourcesLabel`). The invariants each day is built to:
 * - **total sleep** inside the AASM/AAP band for the age — 14–17 h at 0–3 mo,
 *   12–16 h at 4–12 mo, 11–14 h at 1–2 y, 10–13 h at 3–5 y;
 * - **wake windows** inside the age's published tolerance — 45–60 min for a
 *   newborn, 75–120 min at 2–4 mo, 2–2.5 h at 4–6 mo, 2.5–3 h at 6–9 mo,
 *   3–3.5 h at 9–12 mo, 3.5–4.5 h through the 2-to-1 transition, 5–5.5 h on one
 *   nap and 5.5–6 h from two years;
 * - **feeds** 8–12 milk feeds a day at 0–2 mo thinning to ~4 by a year, solids
 *   from ~6 mo building to 3 meals + 2 snacks, with ~500–600 ml of milk a day
 *   alongside them;
 * - **movement** tummy time in short sessions building toward the WHO's 30 min a
 *   day while the baby is not yet mobile, then floor and active play adding up
 *   to the WHO's 180 min a day from the first birthday.
 *
 * The nap counts follow the transitions the literature actually describes: 4–5
 * naps as a newborn, 4 by two months, 3 from four months, 3→2 across 6–9 months,
 * 2 through 9–12 months, 2→1 between 12 and 18 months, and one nap that shortens
 * through the third year until roughly a third of children swap it for quiet
 * time.
 */
export const dayTemplates: DayTemplate[] = [
  {
    // 0–2 mo. Wake windows 45–60 min, 8–12 feeds a day, no fixed clock yet: this
    // is a shape to recognise, not a timetable to hit.
    id: 'newborn',
    upperMonths: 2,
    slots: [
      { time: '07:00', type: 'feed', mins: 30, moment: 'feedWake' },
      { time: '07:35', type: 'care', mins: 15, moment: 'nappyDress' },
      { time: '07:52', type: 'tummy', mins: 5, moment: 'tummyFirst' },
      { time: '08:00', type: 'sleep', mins: 90, moment: 'napFirst' },
      { time: '09:30', type: 'feed', mins: 30, moment: 'feedOnWaking' },
      { time: '10:05', type: 'play', mins: 15, moment: 'faceToFace' },
      { time: '10:25', type: 'sleep', mins: 90, moment: 'napSecond' },
      { time: '11:55', type: 'feed', mins: 30, moment: 'feedMidday' },
      { time: '12:30', type: 'tummy', mins: 5, moment: 'tummySecond' },
      { time: '12:40', type: 'play', mins: 10, moment: 'quietPlay' },
      { time: '12:55', type: 'sleep', mins: 100, moment: 'napLong' },
      { time: '14:35', type: 'feed', mins: 30, moment: 'feedAfternoon' },
      { time: '15:10', type: 'play', mins: 15, moment: 'cuddleChat' },
      { time: '15:27', type: 'tummy', mins: 5, moment: 'tummyThird' },
      { time: '15:35', type: 'sleep', mins: 75, moment: 'napThird' },
      { time: '16:50', type: 'feed', mins: 30, moment: 'feedEvening' },
      { time: '17:25', type: 'play', mins: 15, moment: 'heldAwake' },
      { time: '17:45', type: 'sleep', mins: 45, moment: 'napCatnap' },
      { time: '18:30', type: 'care', mins: 20, moment: 'bathTopTail' },
      { time: '18:55', type: 'wind', mins: 15, moment: 'windDownNight' },
      { time: '19:15', type: 'feed', mins: 30, moment: 'feedBedtime' },
      { time: '19:50', type: 'sleep', mins: 190, moment: 'nightSleep' },
      { time: '23:00', type: 'feed', mins: 25, moment: 'feedNight' },
      { time: '23:30', type: 'sleep', mins: 150, moment: 'nightSleepAgain' },
      { time: '02:00', type: 'feed', mins: 25, moment: 'feedNight' },
      { time: '02:30', type: 'sleep', mins: 150, moment: 'nightSleepAgain' },
      { time: '05:00', type: 'feed', mins: 25, moment: 'feedEarlyHours' },
      { time: '05:30', type: 'sleep', mins: 90, moment: 'nightSleepAgain' },
    ],
  },
  {
    // 2–4 mo. Wake windows stretch to 75–105 min and a four-nap day appears —
    // the first version of this schedule a parent can actually plan around.
    id: 'settling',
    upperMonths: 4,
    slots: [
      { time: '07:00', type: 'feed', mins: 25, moment: 'feedWake' },
      { time: '07:35', type: 'care', mins: 15, moment: 'nappyDress' },
      { time: '07:55', type: 'play', mins: 20, moment: 'faceToFace' },
      { time: '08:20', type: 'tummy', mins: 10, moment: 'tummyFirst' },
      { time: '08:30', type: 'sleep', mins: 60, moment: 'napFirst' },
      { time: '09:45', type: 'feed', mins: 25, moment: 'feedOnWaking' },
      { time: '10:15', type: 'play', mins: 25, moment: 'booksSinging' },
      { time: '10:45', type: 'tummy', mins: 10, moment: 'tummySecond' },
      { time: '11:00', type: 'sleep', mins: 75, moment: 'napSecond' },
      { time: '12:30', type: 'feed', mins: 25, moment: 'feedMidday' },
      { time: '13:00', type: 'play', mins: 30, moment: 'floorPlay' },
      { time: '13:35', type: 'tummy', mins: 10, moment: 'tummyThird' },
      { time: '13:50', type: 'sleep', mins: 90, moment: 'napLong' },
      { time: '15:30', type: 'feed', mins: 25, moment: 'feedAfternoon' },
      { time: '16:00', type: 'play', mins: 30, moment: 'outing' },
      { time: '16:40', type: 'sleep', mins: 55, moment: 'napCatnap' },
      { time: '17:40', type: 'play', mins: 20, moment: 'calmPlay' },
      { time: '18:00', type: 'care', mins: 25, moment: 'bath' },
      { time: '18:30', type: 'wind', mins: 15, moment: 'windDownNight' },
      { time: '18:50', type: 'feed', mins: 25, moment: 'feedBedtime' },
      { time: '19:20', type: 'sleep', mins: 220, moment: 'nightSleep' },
      { time: '23:00', type: 'feed', mins: 20, moment: 'feedNight' },
      { time: '23:25', type: 'sleep', mins: 245, moment: 'nightSleepAgain' },
      { time: '03:30', type: 'feed', mins: 20, moment: 'feedEarlyHours' },
      { time: '03:55', type: 'sleep', mins: 185, moment: 'nightSleepAgain' },
    ],
  },
  {
    // 4–6 mo. Three naps, wake windows 2–2.5 h. Still milk only: solids wait for
    // the readiness signs at around six months.
    id: 'threeNaps',
    upperMonths: 6,
    slots: [
      { time: '07:00', type: 'feed', mins: 25, moment: 'feedWake' },
      { time: '07:35', type: 'care', mins: 20, moment: 'nappyDress' },
      { time: '08:00', type: 'play', mins: 35, moment: 'floorPlay' },
      { time: '08:40', type: 'tummy', mins: 10, moment: 'tummyFirst' },
      { time: '09:00', type: 'sleep', mins: 75, moment: 'napFirst' },
      { time: '10:15', type: 'feed', mins: 25, moment: 'feedOnWaking' },
      { time: '10:50', type: 'play', mins: 45, moment: 'booksSinging' },
      { time: '11:40', type: 'tummy', mins: 10, moment: 'tummySecond' },
      { time: '12:30', type: 'sleep', mins: 90, moment: 'napLong' },
      { time: '14:00', type: 'feed', mins: 25, moment: 'feedMidday' },
      { time: '14:35', type: 'play', mins: 60, moment: 'outing' },
      { time: '15:45', type: 'tummy', mins: 10, moment: 'tummyThird' },
      { time: '16:30', type: 'sleep', mins: 45, moment: 'napCatnap' },
      { time: '17:15', type: 'feed', mins: 25, moment: 'feedAfternoon' },
      { time: '17:50', type: 'play', mins: 30, moment: 'calmPlay' },
      { time: '18:25', type: 'care', mins: 30, moment: 'bath' },
      { time: '19:00', type: 'wind', mins: 15, moment: 'windDownNight' },
      { time: '19:15', type: 'feed', mins: 25, moment: 'feedBedtime' },
      { time: '19:45', type: 'sleep', mins: 210, moment: 'nightSleep' },
      { time: '23:15', type: 'feed', mins: 20, moment: 'feedNight' },
      { time: '23:40', type: 'sleep', mins: 230, moment: 'nightSleepAgain' },
      { time: '03:30', type: 'feed', mins: 15, moment: 'feedEarlyHours' },
      { time: '03:50', type: 'sleep', mins: 190, moment: 'nightSleepAgain' },
    ],
  },
  {
    // 6–9 mo. Solids start alongside milk, and the third nap starts to go: this
    // day still has the catnap, and the detail says when to drop it.
    id: 'solids',
    upperMonths: 9,
    slots: [
      { time: '07:00', type: 'feed', mins: 20, moment: 'feedWake' },
      { time: '07:30', type: 'meal', mins: 25, moment: 'breakfast' },
      { time: '08:05', type: 'care', mins: 15, moment: 'nappyDress' },
      { time: '08:25', type: 'play', mins: 40, moment: 'floorPlay' },
      { time: '09:10', type: 'tummy', mins: 15, moment: 'tummyFirst' },
      { time: '09:40', type: 'sleep', mins: 60, moment: 'napFirst' },
      { time: '10:40', type: 'feed', mins: 20, moment: 'feedOnWaking' },
      { time: '11:10', type: 'play', mins: 45, moment: 'booksSinging' },
      { time: '12:00', type: 'meal', mins: 30, moment: 'lunch' },
      { time: '13:00', type: 'sleep', mins: 90, moment: 'napLong' },
      { time: '14:30', type: 'feed', mins: 20, moment: 'feedMidday' },
      { time: '15:00', type: 'play', mins: 60, moment: 'outing' },
      { time: '16:10', type: 'tummy', mins: 15, moment: 'tummySecond' },
      { time: '16:45', type: 'sleep', mins: 30, moment: 'napCatnap' },
      { time: '17:15', type: 'meal', mins: 30, moment: 'dinner' },
      { time: '17:55', type: 'care', mins: 25, moment: 'bath' },
      { time: '18:25', type: 'play', mins: 20, moment: 'calmPlay' },
      { time: '18:50', type: 'wind', mins: 15, moment: 'windDownNight' },
      { time: '19:05', type: 'feed', mins: 20, moment: 'feedBedtime' },
      { time: '19:30', type: 'sleep', mins: 420, moment: 'nightSleep' },
      { time: '02:30', type: 'feed', mins: 15, moment: 'feedNight' },
      { time: '02:45', type: 'sleep', mins: 255, moment: 'nightSleepAgain' },
    ],
  },
  {
    // 9–12 mo. Two naps, wake windows 2.5–3.5 h, three meals plus a snack, and
    // gross-motor play takes over from tummy time as the child gets mobile.
    id: 'twoNaps',
    upperMonths: 12,
    slots: [
      { time: '07:00', type: 'feed', mins: 20, moment: 'feedWake' },
      { time: '07:30', type: 'meal', mins: 25, moment: 'breakfast' },
      { time: '08:05', type: 'care', mins: 15, moment: 'nappyDress' },
      { time: '08:25', type: 'active', mins: 45, moment: 'activeMorning' },
      { time: '09:15', type: 'tummy', mins: 15, moment: 'tummyFirst' },
      { time: '09:45', type: 'sleep', mins: 60, moment: 'napFirst' },
      { time: '10:45', type: 'feed', mins: 20, moment: 'feedOnWaking' },
      { time: '11:15', type: 'active', mins: 50, moment: 'activeMidMorning' },
      { time: '12:15', type: 'meal', mins: 30, moment: 'lunch' },
      { time: '12:55', type: 'play', mins: 30, moment: 'booksSinging' },
      { time: '13:45', type: 'sleep', mins: 90, moment: 'napSecond' },
      { time: '15:15', type: 'feed', mins: 20, moment: 'feedAfternoon' },
      { time: '15:45', type: 'meal', mins: 15, moment: 'snackAfternoon' },
      { time: '16:05', type: 'active', mins: 60, moment: 'activeAfternoon' },
      { time: '17:15', type: 'meal', mins: 30, moment: 'dinner' },
      { time: '17:55', type: 'care', mins: 25, moment: 'bath' },
      { time: '18:25', type: 'play', mins: 20, moment: 'calmPlay' },
      { time: '18:50', type: 'wind', mins: 15, moment: 'windDownNight' },
      { time: '19:05', type: 'feed', mins: 20, moment: 'feedBedtime' },
      { time: '19:30', type: 'sleep', mins: 690, moment: 'nightSleep' },
    ],
  },
  {
    // 12–18 mo. The 2-to-1 nap transition, written as it is actually lived: a
    // short morning nap that is on its way out, and a long midday one taking
    // over. The morning nap's own text says when to stop offering it.
    id: 'napTransition',
    upperMonths: 18,
    slots: [
      { time: '07:00', type: 'meal', mins: 30, moment: 'breakfast' },
      { time: '07:45', type: 'care', mins: 15, moment: 'nappyDress' },
      { time: '08:15', type: 'active', mins: 75, moment: 'activeMorning' },
      { time: '09:35', type: 'meal', mins: 15, moment: 'snackMorning' },
      { time: '10:00', type: 'sleep', mins: 30, moment: 'napShortMorning' },
      { time: '10:35', type: 'active', mins: 75, moment: 'activeMidMorning' },
      { time: '11:55', type: 'meal', mins: 30, moment: 'lunch' },
      { time: '12:35', type: 'wind', mins: 10, moment: 'windDownNap' },
      { time: '12:50', type: 'sleep', mins: 105, moment: 'napOne' },
      { time: '14:40', type: 'meal', mins: 15, moment: 'snackAfternoon' },
      { time: '15:10', type: 'active', mins: 90, moment: 'activeAfternoon' },
      { time: '16:45', type: 'play', mins: 30, moment: 'booksSinging' },
      { time: '17:25', type: 'meal', mins: 30, moment: 'dinner' },
      { time: '18:05', type: 'care', mins: 25, moment: 'bath' },
      { time: '18:35', type: 'wind', mins: 20, moment: 'windDownNight' },
      { time: '18:55', type: 'feed', mins: 15, moment: 'feedBedtime' },
      { time: '19:30', type: 'sleep', mins: 690, moment: 'nightSleep' },
    ],
  },
  {
    // 18–24 mo. One nap after lunch, wake windows 5–5.5 h, and the WHO's 180 min
    // of movement a day carried by three active blocks.
    id: 'oneNap',
    upperMonths: 24,
    slots: [
      { time: '07:00', type: 'meal', mins: 30, moment: 'breakfast' },
      { time: '07:45', type: 'care', mins: 15, moment: 'nappyDress' },
      { time: '08:15', type: 'active', mins: 90, moment: 'activeMorning' },
      { time: '09:50', type: 'meal', mins: 15, moment: 'snackMorning' },
      { time: '10:15', type: 'active', mins: 90, moment: 'activeMidMorning' },
      { time: '11:45', type: 'meal', mins: 30, moment: 'lunch' },
      { time: '12:15', type: 'wind', mins: 10, moment: 'windDownNap' },
      { time: '12:30', type: 'sleep', mins: 120, moment: 'napOne' },
      { time: '14:50', type: 'meal', mins: 15, moment: 'snackAfternoon' },
      { time: '15:20', type: 'active', mins: 90, moment: 'activeAfternoon' },
      { time: '16:55', type: 'play', mins: 35, moment: 'booksSinging' },
      { time: '17:35', type: 'meal', mins: 30, moment: 'dinner' },
      { time: '18:15', type: 'care', mins: 25, moment: 'bath' },
      { time: '18:45', type: 'wind', mins: 20, moment: 'windDownNight' },
      { time: '19:30', type: 'sleep', mins: 690, moment: 'nightSleep' },
    ],
  },
  {
    // 2–3 y. One shorter nap, wake windows 5.5–6 h, and teeth added to the
    // bedtime routine now there are enough of them to brush twice a day.
    id: 'toddler',
    upperMonths: 36,
    slots: [
      { time: '07:00', type: 'meal', mins: 30, moment: 'breakfast' },
      { time: '07:45', type: 'care', mins: 20, moment: 'nappyDress' },
      { time: '08:15', type: 'active', mins: 90, moment: 'activeMorning' },
      { time: '09:50', type: 'meal', mins: 15, moment: 'snackMorning' },
      { time: '10:20', type: 'active', mins: 105, moment: 'activeMidMorning' },
      { time: '12:10', type: 'meal', mins: 35, moment: 'lunch' },
      { time: '12:45', type: 'wind', mins: 10, moment: 'windDownNap' },
      { time: '13:00', type: 'sleep', mins: 90, moment: 'napOne' },
      { time: '14:50', type: 'meal', mins: 15, moment: 'snackAfternoon' },
      { time: '15:20', type: 'active', mins: 120, moment: 'activeAfternoon' },
      { time: '17:25', type: 'play', mins: 30, moment: 'booksSinging' },
      { time: '18:00', type: 'meal', mins: 35, moment: 'dinner' },
      { time: '18:40', type: 'care', mins: 25, moment: 'teethPyjamas' },
      { time: '19:10', type: 'wind', mins: 25, moment: 'windDownNight' },
      { time: '19:40', type: 'sleep', mins: 680, moment: 'nightSleep' },
    ],
  },
  {
    // 3 y+. The nap is on its way out — this day keeps a rest period rather than
    // a nap, which is what most children this age actually need, and pushes the
    // hour it frees into movement.
    id: 'preschool',
    upperMonths: 999,
    slots: [
      { time: '07:00', type: 'meal', mins: 30, moment: 'breakfast' },
      { time: '07:45', type: 'care', mins: 20, moment: 'nappyDress' },
      { time: '08:15', type: 'active', mins: 105, moment: 'activeMorning' },
      { time: '10:05', type: 'meal', mins: 15, moment: 'snackMorning' },
      { time: '10:35', type: 'active', mins: 120, moment: 'activeMidMorning' },
      { time: '12:40', type: 'meal', mins: 35, moment: 'lunch' },
      { time: '13:20', type: 'wind', mins: 10, moment: 'windDownNap' },
      { time: '13:30', type: 'sleep', mins: 60, moment: 'napQuiet' },
      { time: '14:45', type: 'meal', mins: 15, moment: 'snackAfternoon' },
      { time: '15:15', type: 'active', mins: 120, moment: 'activeAfternoon' },
      { time: '17:20', type: 'play', mins: 40, moment: 'booksSinging' },
      { time: '18:10', type: 'meal', mins: 35, moment: 'dinner' },
      { time: '18:50', type: 'care', mins: 25, moment: 'teethPyjamas' },
      { time: '19:20', type: 'wind', mins: 25, moment: 'windDownNight' },
      { time: '19:50', type: 'sleep', mins: 670, moment: 'nightSleep' },
    ],
  },
]

/** The month each template starts at — its predecessor's exclusive upper bound.
 *  The bands tile the timeline with no gap and no overlap, so this is derived
 *  rather than restated (a hand-written second copy is a gap waiting to happen). */
export function templateStartMonths(index: number): number {
  return index === 0 ? 0 : dayTemplates[index - 1].upperMonths
}

/** The template for an age in months. With no baby on file the 2–4 month day is
 *  the default: it is the earliest band with a clock a reader can recognise. */
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

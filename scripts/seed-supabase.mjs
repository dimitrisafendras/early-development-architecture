/**
 * Seed a real Supabase test account with a rich backlog of data, so the
 * server-backed screens (baby profile + growth, tummy tracker, feed log,
 * checklist, family) can be exercised end to end.
 *
 * Requires the SERVICE ROLE key (admin) — it creates an auth user and writes
 * rows on their behalf. NEVER ship the service-role key to the browser; this
 * runs only from your machine / CI.
 *
 * Credentials are read from the environment, or from a local `.env.local` /
 * `.env` file (both git-ignored) so you can keep them out of your shell history:
 *
 *   # .env.local
 *   SUPABASE_URL=https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...          # service_role key — never commit
 *   # optional: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY also enable the app
 *
 * Then: `npm run seed:supabase`
 *
 * Re-runnable: it finds the existing user and wipes their previous seed first.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

// Load KEY=VALUE lines from a local env file (no dependency), without clobbering
// anything already set in the real environment.
for (const file of ['.env.local', '.env']) {
  try {
    for (const line of readFileSync(new URL(`../${file}`, import.meta.url), 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
    }
  } catch {
    /* file absent — fine */
  }
}

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.env.SEED_EMAIL || 'test@earlydev.app'
const password = process.env.SEED_PASSWORD || 'test-password-123'
const partnerEmail = process.env.SEED_PARTNER_EMAIL || 'partner@earlydev.app'

if (!url || !serviceKey) {
  console.error(
    'Missing env. Set SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.\n' +
      'Find the service_role key in Supabase → Project Settings → API.',
  )
  process.exit(1)
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const CHECKLIST_ITEMS = ['respond', 'parentese', 'tummy', 'music', 'screens', 'sleep']

const rand = (min, max) => min + Math.random() * (max - min)
const randInt = (min, max) => Math.floor(rand(min, max + 1))
const round = (n, dp = 1) => Number(n.toFixed(dp))
const iso = (d) => d.toISOString()
const dateKey = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
const daysAgo = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

async function getOrCreateUser() {
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: 'Test Parent' },
  })
  if (created.data?.user) {
    console.log(`✓ created auth user ${email}`)
    return created.data.user
  }
  // Already exists — page through and find it.
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    if (found) {
      // Reset the password so the documented credentials always work.
      await admin.auth.admin.updateUserById(found.id, { password, email_confirm: true })
      console.log(`✓ reusing existing auth user ${email}`)
      return found
    }
    if (data.users.length < 200) break
  }
  throw created.error || new Error('Could not create or find the test user')
}

async function wipe(owner) {
  // Order matters only for rows without a cascading FK; deleting babies cascades
  // measurements/sessions/feeds that carry a baby_id.
  await admin.from('feed_logs').delete().eq('owner', owner)
  await admin.from('tummy_sessions').delete().eq('owner', owner)
  await admin.from('baby_measurements').delete().eq('owner', owner)
  await admin.from('checklist_entries').delete().eq('owner', owner)
  await admin.from('babies').delete().eq('owner', owner)
  await admin.from('households').delete().eq('created_by', owner)
  console.log('✓ cleared previous seed for this user')
}

async function insert(table, rows) {
  if (!rows.length) return []
  const { data, error } = await admin.from(table).insert(rows).select()
  if (error) throw new Error(`insert ${table}: ${error.message}`)
  return data
}

async function main() {
  const user = await getOrCreateUser()
  const owner = user.id
  await wipe(owner)

  // Household (the AFTER-INSERT trigger adds the creator as the owning member,
  // using created_by for user_id — which works under the service role).
  let householdId = null
  const { data: hh, error: hhErr } = await admin
    .from('households')
    .insert({ name: 'The Test Family', created_by: owner })
    .select()
    .single()
  if (hhErr) console.warn(`! household skipped: ${hhErr.message}`)
  else {
    householdId = hh.id
    console.log('✓ household "The Test Family" created')
    // The on_household_created trigger fills the owner member's email from the
    // request JWT — but the seed inserts via the service role (no user JWT), so
    // that lands null and the Family member row shows a dash. Backfill it so the
    // seeded account looks like one a real user created through the app.
    const { error: memErr } = await admin
      .from('household_members')
      .update({ email })
      .eq('household_id', householdId)
      .eq('user_id', owner)
    if (memErr) console.warn(`! owner email backfill skipped: ${memErr.message}`)
    // A pending co-parent invite, so the Family page has something to show.
    const { error: invErr } = await admin
      .from('household_invites')
      .insert({ household_id: householdId, email: partnerEmail, invited_by: owner })
    if (invErr) console.warn(`! invite skipped: ${invErr.message}`)
    else console.log(`✓ pending invite for ${partnerEmail}`)
  }

  // Baby — ~4.5 months old.
  const birth = daysAgo(135)
  const [baby] = await insert('babies', [
    {
      owner,
      household_id: householdId,
      name: 'Riley',
      birth_date: dateKey(birth),
      palette: Math.random() < 0.5 ? 'blue' : 'red',
    },
  ])
  console.log(`✓ baby "${baby.name}" (born ${baby.birth_date})`)

  // Growth measurements — roughly every 10 days from birth to now.
  const measurements = []
  for (let d = 0; d <= 135; d += 10) {
    const on = daysAgo(135 - d)
    const months = d / 30.4
    measurements.push({
      owner,
      household_id: householdId,
      baby_id: baby.id,
      measured_on: dateKey(on),
      weight_kg: round(3.4 + months * 0.85 + rand(-0.1, 0.1), 2),
      height_cm: round(50 + months * 3.4 + rand(-0.4, 0.4), 1),
      head_cm: round(35 + months * 1.3 + rand(-0.2, 0.2), 1),
      note: null,
    })
  }
  await insert('baby_measurements', measurements)
  console.log(`✓ ${measurements.length} growth measurements`)

  // Tummy sessions — 1–3 per day over the last 90 days, 4–28 min each.
  const sessions = []
  for (let d = 0; d < 90; d++) {
    const count = randInt(1, 3)
    for (let s = 0; s < count; s++) {
      const start = daysAgo(d)
      start.setHours(8 + s * 4 + randInt(0, 1), randInt(0, 59), 0, 0)
      if (start.getTime() > Date.now()) continue
      const end = new Date(start.getTime() + randInt(4, 28) * 60_000)
      sessions.push({
        owner,
        household_id: householdId,
        baby_id: baby.id,
        started_at: iso(start),
        ended_at: iso(end),
      })
    }
  }
  await insert('tummy_sessions', sessions)
  console.log(`✓ ${sessions.length} tummy sessions`)

  // Feed logs — 6–8 per day over the last 30 days.
  const methods = ['bottle', 'breast', 'solid']
  const feeds = []
  for (let d = 0; d < 30; d++) {
    const count = randInt(6, 8)
    for (let f = 0; f < count; f++) {
      const fed = daysAgo(d)
      fed.setHours(6 + f * 2.5, randInt(0, 59), 0, 0)
      if (fed.getTime() > Date.now()) continue
      const method = methods[randInt(0, 2)]
      feeds.push({
        owner,
        household_id: householdId,
        baby_id: baby.id,
        fed_at: iso(fed),
        method,
        amount_ml: method === 'breast' ? null : randInt(90, 180),
        minutes: method === 'breast' ? randInt(8, 25) : null,
        note: null,
      })
    }
  }
  await insert('feed_logs', feeds)
  console.log(`✓ ${feeds.length} feed logs`)

  // Checklist — all items ticked for the last 12 consecutive days (a streak).
  const entries = []
  for (let d = 0; d < 12; d++) {
    const day = dateKey(daysAgo(d))
    for (const item of CHECKLIST_ITEMS) {
      entries.push({
        owner,
        baby_id: baby.id,
        day,
        item_id: item,
        checked: true,
        updated_at: iso(new Date()),
      })
    }
  }
  await insert('checklist_entries', entries)
  console.log(`✓ ${entries.length} checklist entries (12-day streak)`)

  console.log('\n✅ Seed complete. Sign in with:')
  console.log(`   email:    ${email}`)
  console.log(`   password: ${password}`)
}

main().catch((err) => {
  console.error('\n✖ Seed failed:', err.message || err)
  process.exit(1)
})

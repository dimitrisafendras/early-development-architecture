/**
 * Ensure a second "co-parent" test account exists, so household sharing can be
 * tested end to end (partner accepts the invite and sees the shared baby).
 *
 * Idempotent and non-destructive: it creates partner@earlydev.app if missing,
 * or just resets its password if it already exists. It never touches the main
 * test user or any data. Uses the SERVICE ROLE key from .env.local (admin) —
 * same authorized mechanism as the seed. Run: `node scripts/create-partner.mjs`
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

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
const email = process.env.SEED_PARTNER_EMAIL || 'partner@earlydev.app'
const password = process.env.SEED_PARTNER_PASSWORD || 'partner-password-123'

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function ensurePartner() {
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: 'Test Co-Parent' },
  })
  if (created.data?.user) {
    console.log(`✓ created co-parent ${email}`)
    return
  }
  // Already exists — reset the password so the documented credentials work.
  for (let page = 1; page <= 5; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    if (found) {
      await admin.auth.admin.updateUserById(found.id, { password, email_confirm: true })
      console.log(`✓ reusing co-parent ${email} (password reset)`)
      return
    }
    if (data.users.length < 200) break
  }
  throw new Error(`could not create or find ${email}: ${created.error?.message ?? 'unknown'}`)
}

await ensurePartner()
console.log('\n✅ Co-parent ready. Sign in with:')
console.log(`   email:    ${email}`)
console.log(`   password: ${password}`)

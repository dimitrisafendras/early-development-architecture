import { supabase } from './supabase'
import type { Palette } from '../store'

/**
 * Typed data-access for the synced feature tables. Every write stamps `owner`
 * with the current user id so the RLS `with check (owner = auth.uid())` passes.
 * All helpers throw if Supabase is unconfigured or no user is signed in — the
 * UI guards on `isSupabaseEnabled` + session before calling.
 */

export interface Baby {
  id: string
  owner: string
  household_id: string | null
  name: string
  birth_date: string
  palette: Palette
  created_at: string
}

export interface TummySession {
  id: string
  owner: string
  household_id: string | null
  baby_id: string | null
  started_at: string
  ended_at: string | null
}

export interface Measurement {
  id: string
  owner: string
  household_id: string | null
  baby_id: string
  measured_on: string
  weight_kg: number | null
  height_cm: number | null
  head_cm: number | null
  note: string | null
}

export interface ChecklistEntry {
  item_id: string
  checked: boolean
}

function client() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

async function currentUserId(): Promise<string> {
  const { data, error } = await client().auth.getUser()
  if (error || !data.user) throw new Error('Not signed in')
  return data.user.id
}

/* ------------------------------------------------------------------ babies */

export async function listBabies(): Promise<Baby[]> {
  const { data, error } = await client()
    .from('babies')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as Baby[]
}

export async function createBaby(input: {
  name: string
  birth_date: string
  palette: Palette
  household_id?: string | null
}): Promise<Baby> {
  const owner = await currentUserId()
  const { data, error } = await client()
    .from('babies')
    .insert({ ...input, owner })
    .select()
    .single()
  if (error) throw error
  return data as Baby
}

export async function updateBaby(
  id: string,
  patch: { name?: string; birth_date?: string; palette?: Palette },
): Promise<void> {
  const { error } = await client().from('babies').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteBaby(id: string): Promise<void> {
  const { error } = await client().from('babies').delete().eq('id', id)
  if (error) throw error
}

/* ----------------------------------------------------------- measurements */

export async function listMeasurements(babyId: string): Promise<Measurement[]> {
  const { data, error } = await client()
    .from('baby_measurements')
    .select('*')
    .eq('baby_id', babyId)
    .order('measured_on', { ascending: true })
  if (error) throw error
  return (data ?? []) as Measurement[]
}

export async function addMeasurement(input: {
  baby_id: string
  measured_on: string
  weight_kg?: number | null
  height_cm?: number | null
  head_cm?: number | null
  note?: string | null
  household_id?: string | null
}): Promise<Measurement> {
  const owner = await currentUserId()
  const { data, error } = await client()
    .from('baby_measurements')
    .insert({ ...input, owner })
    .select()
    .single()
  if (error) throw error
  return data as Measurement
}

export async function deleteMeasurement(id: string): Promise<void> {
  const { error } = await client().from('baby_measurements').delete().eq('id', id)
  if (error) throw error
}

/* --------------------------------------------------------- tummy sessions */

export async function listSessionsSince(isoDate: string): Promise<TummySession[]> {
  const { data, error } = await client()
    .from('tummy_sessions')
    .select('*')
    .gte('started_at', isoDate)
    .order('started_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as TummySession[]
}

/** Any session still open (ended_at is null), newest first. */
export async function findOpenSession(): Promise<TummySession | null> {
  const { data, error } = await client()
    .from('tummy_sessions')
    .select('*')
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
  if (error) throw error
  return (data?.[0] as TummySession) ?? null
}

export async function openSession(
  babyId: string | null,
  startedAt: string,
  householdId: string | null = null,
): Promise<TummySession> {
  const owner = await currentUserId()
  const { data, error } = await client()
    .from('tummy_sessions')
    .insert({ owner, baby_id: babyId, started_at: startedAt, household_id: householdId })
    .select()
    .single()
  if (error) throw error
  return data as TummySession
}

export async function closeSession(id: string, endedAt: string): Promise<void> {
  const { error } = await client().from('tummy_sessions').update({ ended_at: endedAt }).eq('id', id)
  if (error) throw error
}

/** Insert an already-finished session (used when persisting local-only history on sign-in). */
export async function insertClosedSession(
  babyId: string | null,
  startedAt: string,
  endedAt: string,
): Promise<TummySession> {
  const owner = await currentUserId()
  const { data, error } = await client()
    .from('tummy_sessions')
    .insert({ owner, baby_id: babyId, started_at: startedAt, ended_at: endedAt })
    .select()
    .single()
  if (error) throw error
  return data as TummySession
}

export async function deleteSession(id: string): Promise<void> {
  const { error } = await client().from('tummy_sessions').delete().eq('id', id)
  if (error) throw error
}

/* ------------------------------------------------------ checklist entries */

export async function getChecklistForDay(day: string): Promise<string[]> {
  const { data, error } = await client()
    .from('checklist_entries')
    .select('item_id, checked')
    .eq('day', day)
  if (error) throw error
  return (data ?? []).filter((r) => r.checked).map((r) => r.item_id as string)
}

export async function upsertChecklistEntry(
  day: string,
  itemId: string,
  checked: boolean,
): Promise<void> {
  const owner = await currentUserId()
  const { error } = await client()
    .from('checklist_entries')
    .upsert(
      { owner, day, item_id: itemId, checked, updated_at: new Date().toISOString() },
      { onConflict: 'owner,day,item_id' },
    )
  if (error) throw error
}

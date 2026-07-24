import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseEnabled } from './supabase'
import { useSession } from './use-session'

/**
 * Household ("family") data-access + hook. A household groups multiple parents
 * so they share babies, measurements, and tummy sessions. Membership-based RLS
 * lives in migration 0004; the client just calls the SECURITY DEFINER RPCs
 * (`accept_invite`) and the RLS-guarded tables.
 */

export interface Household {
  id: string
  name: string
  created_by: string
  created_at: string
}
export interface Member {
  id: string
  household_id: string
  user_id: string
  email: string | null
  role: string
}
export interface Invite {
  id: string
  household_id: string
  email: string
  invited_by: string
  created_at: string
  accepted_at: string | null
}

function client() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export async function listMyHouseholds(): Promise<Household[]> {
  const { data, error } = await client()
    .from('households')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as Household[]
}

export async function createHousehold(name: string): Promise<Household> {
  const { data: userData } = await client().auth.getUser()
  const uid = userData.user?.id
  if (!uid) throw new Error('Not signed in')
  const { data, error } = await client()
    .from('households')
    .insert({ name, created_by: uid })
    .select()
    .single()
  if (error) throw error
  return data as Household
}

export async function listMembers(householdId: string): Promise<Member[]> {
  const { data, error } = await client()
    .from('household_members')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as Member[]
}

export async function listInvites(householdId: string): Promise<Invite[]> {
  const { data, error } = await client()
    .from('household_invites')
    .select('*')
    .eq('household_id', householdId)
    .is('accepted_at', null)
  if (error) throw error
  return (data ?? []) as Invite[]
}

export async function inviteByEmail(householdId: string, email: string): Promise<void> {
  const { data: userData } = await client().auth.getUser()
  const uid = userData.user?.id
  if (!uid) throw new Error('Not signed in')
  const { error } = await client()
    .from('household_invites')
    .upsert(
      { household_id: householdId, email: email.trim().toLowerCase(), invited_by: uid, accepted_at: null },
      { onConflict: 'household_id,email' },
    )
  if (error) throw error
}

export async function deleteInvite(id: string): Promise<void> {
  const { error } = await client().from('household_invites').delete().eq('id', id)
  if (error) throw error
}

/** Invites addressed to the signed-in user's email that aren't accepted yet. */
export async function myPendingInvites(): Promise<Invite[]> {
  const { data: userData } = await client().auth.getUser()
  const email = userData.user?.email?.toLowerCase()
  if (!email) return []
  const { data, error } = await client()
    .from('household_invites')
    .select('*')
    .eq('email', email)
    .is('accepted_at', null)
  if (error) throw error
  return (data ?? []) as Invite[]
}

export async function acceptInvite(inviteId: string): Promise<void> {
  const { error } = await client().rpc('accept_invite', { p_invite: inviteId })
  if (error) throw error
}

export async function leaveHousehold(householdId: string): Promise<void> {
  const { data: userData } = await client().auth.getUser()
  const uid = userData.user?.id
  if (!uid) throw new Error('Not signed in')
  const { error } = await client()
    .from('household_members')
    .delete()
    .eq('household_id', householdId)
    .eq('user_id', uid)
  if (error) throw error
}

/** Assign every baby the user owns into a household (share them with the family). */
export async function shareOwnedBabies(householdId: string): Promise<void> {
  const { data: userData } = await client().auth.getUser()
  const uid = userData.user?.id
  if (!uid) throw new Error('Not signed in')
  const { error } = await client()
    .from('babies')
    .update({ household_id: householdId })
    .eq('owner', uid)
    .is('household_id', null)
  if (error) throw error
}

/**
 * The user's current household (first membership), its members and pending
 * invites, plus the invites addressed to the user. Loads only when signed in.
 */
export function useHousehold() {
  const { session, loading: sessionLoading } = useSession()
  const ready = isSupabaseEnabled && Boolean(session)
  const [household, setHousehold] = useState<Household | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [pending, setPending] = useState<Invite[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!ready) {
      setHousehold(null)
      setMembers([])
      setInvites([])
      setPending([])
      return
    }
    setLoading(true)
    try {
      const [households, myPending] = await Promise.all([listMyHouseholds(), myPendingInvites()])
      setPending(myPending)
      const current = households[0] ?? null
      setHousehold(current)
      if (current) {
        const [m, inv] = await Promise.all([listMembers(current.id), listInvites(current.id)])
        setMembers(m)
        setInvites(inv)
      } else {
        setMembers([])
        setInvites([])
      }
    } finally {
      setLoading(false)
    }
  }, [ready])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return {
    ready,
    loading: loading || sessionLoading,
    household,
    members,
    invites,
    pending,
    refresh,
  }
}

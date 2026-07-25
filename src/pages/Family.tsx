import { useState, type FormEvent } from 'react'
import { Users, UserPlus, Home as HomeIcon, Mail, Check, X, Share2, LogOut, Pencil, Trash2, Baby as BabyIcon } from 'lucide-react'
import { PageFrame } from '../components/PageFrame'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useHousehold,
  createHousehold,
  inviteByEmail,
  deleteInvite,
  acceptInvite,
  leaveHousehold,
  shareOwnedBabies,
  renameHousehold,
  removeMember,
  deleteHousehold,
} from '../lib/household'
import { useSession } from '../lib/use-session'
import { useBabies } from '../lib/useBabies'
import { ageInMonths } from '../lib/schedule'
import { useT } from '../i18n'

export default function Family() {
  const t = useT()
  const tf = t.family
  const { ready, loading, household, members, invites, pending, refresh } = useHousehold()
  const { babies, refresh: refreshBabies } = useBabies()
  const { session } = useSession()
  const myId = session?.user?.id
  const isOwner = Boolean(household && household.created_by === myId)
  // Babies already shared with this family, and the caller's own babies that
  // aren't shared yet (the only ones the Share button can move).
  const familyBabies = household ? babies.filter((b) => b.household_id === household.id) : []
  const shareableCount = babies.filter((b) => b.owner === myId && !b.household_id).length
  const [busy, setBusy] = useState<string>('')
  const [error, setError] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function run(key: string, fn: () => Promise<unknown>) {
    setBusy(key)
    setError('')
    try {
      await fn()
      await refresh()
    } catch {
      setError(tf.error)
    } finally {
      setBusy('')
    }
  }

  return (
    <PageFrame title={tf.title} description={tf.subtitle}>
      {!ready ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">{tf.signInPrompt}</CardContent>
        </Card>
      ) : (
        <>
          {/* Invitations addressed to me (any household) */}
          {pending.length > 0 && (
            <Card>
              <CardContent>
                <p className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-foreground">
                  <Mail className="size-4 text-primary" /> {tf.yourInvitesTitle}
                </p>
                <ul className="space-y-2">
                  {pending.map((inv) => (
                    <li key={inv.id} className="flex items-center justify-between gap-3 rounded-lg bg-muted p-3">
                      <span className="text-sm text-muted-foreground">{tf.from}</span>
                      <Button
                        size="sm"
                        disabled={busy === inv.id}
                        onClick={() =>
                          void run(inv.id, async () => {
                            await acceptInvite(inv.id)
                            // Joining a household reveals its shared babies —
                            // refresh so they show without a manual reload.
                            await refreshBabies()
                          })
                        }
                      >
                        <Check className="mr-1 size-4" />
                        {busy === inv.id ? tf.accepting : tf.accept}
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {loading && !household ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-40" />
            </div>
          ) : !household ? (
            <CreateFamilyForm
              busy={busy === 'create'}
              onCreate={(name) => run('create', () => createHousehold(name))}
            />
          ) : (
            <>
              {/* Members */}
              <Card>
                <CardContent>
                  {editingName ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        if (nameDraft.trim()) {
                          void run('rename', () => renameHousehold(household.id, nameDraft.trim()))
                          setEditingName(false)
                        }
                      }}
                      className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center"
                    >
                      <Input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} autoFocus />
                      <div className="flex items-center gap-2">
                        <Button type="submit" size="sm" disabled={busy === 'rename'}>
                          {tf.save}
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => setEditingName(false)}>
                          {tf.cancel}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="mb-1 flex items-center gap-2">
                      <p className="flex items-center gap-2 text-lg font-semibold text-foreground">
                        <HomeIcon className="size-5 text-primary" /> {household.name}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={tf.rename}
                        onClick={() => {
                          setNameDraft(household.name)
                          setEditingName(true)
                        }}
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                    </div>
                  )}
                  <p className="mb-4 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                    <Users className="size-3.5" /> {tf.membersTitle}
                  </p>
                  <ul className="divide-y divide-border">
                    {members.map((m) => (
                      <li key={m.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                        <span className="min-w-0 truncate text-foreground">
                          {m.email ?? '—'}
                          {m.user_id === myId && <span className="text-muted-foreground"> ({tf.you})</span>}
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            {m.role === 'owner' ? tf.roleOwner : tf.roleParent}
                          </span>
                          {isOwner && m.user_id !== myId && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={tf.remove}
                              onClick={() => void run(m.id, () => removeMember(m.id))}
                              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            >
                              <X className="size-4" />
                            </Button>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Invite + pending */}
              <Card>
                <CardContent>
                  <p className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-foreground">
                    <UserPlus className="size-4 text-primary" /> {tf.inviteTitle}
                  </p>
                  <InviteForm
                    busy={busy === 'invite'}
                    onInvite={(email) => run('invite', () => inviteByEmail(household.id, email))}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">{tf.invitedNote}</p>
                  {invites.length > 0 && (
                    <div className="mt-4 border-t border-border pt-3">
                      <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">{tf.pendingTitle}</p>
                      <ul className="space-y-1.5">
                        {invites.map((inv) => (
                          <li key={inv.id} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{inv.email}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => void run(inv.id, () => deleteInvite(inv.id))}
                              className="shrink-0 gap-1 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            >
                              <X className="size-3.5" /> {tf.revoke}
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Shared babies + share + leave */}
              <Card>
                <CardContent className="flex flex-col gap-4">
                  <div>
                    <p className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-foreground">
                      <BabyIcon className="size-4 text-primary" /> {tf.sharedBabiesTitle}
                    </p>
                    {familyBabies.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{tf.sharedBabiesEmpty}</p>
                    ) : (
                      <ul className="divide-y divide-border">
                        {familyBabies.map((b) => (
                          <li
                            key={b.id}
                            className="flex items-center justify-between gap-3 py-2.5 text-sm"
                          >
                            <span className="flex min-w-0 items-center gap-2 text-foreground">
                              <BabyIcon className="size-4 shrink-0 text-primary" />
                              <span className="truncate font-medium">{b.name}</span>
                              <span className="shrink-0 text-muted-foreground">
                                · {ageInMonths(b.birth_date)} {t.baby.monthsShort}
                              </span>
                            </span>
                            {b.owner === myId && (
                              <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                {tf.sharedByYou}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="border-t border-border pt-4">
                    <Button
                      variant="secondary"
                      disabled={busy === 'share' || shareableCount === 0}
                      onClick={() =>
                        void run('share', async () => {
                          await shareOwnedBabies(household.id)
                          await refreshBabies()
                        })
                      }
                    >
                      <Share2 className="mr-2 size-4" /> {tf.shareBabies}
                    </Button>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {shareableCount > 0 ? tf.shareBabiesNote : tf.shareBabiesAllShared}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
                    <Button
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                      disabled={busy === 'leave'}
                      onClick={() => void run('leave', () => leaveHousehold(household.id))}
                    >
                      <LogOut className="mr-2 size-4" /> {tf.leave}
                    </Button>
                    {isOwner &&
                      (confirmDelete ? (
                        <span className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="text-muted-foreground">{tf.deleteConfirm}</span>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={busy === 'delete'}
                            onClick={() =>
                              void run('delete', () => deleteHousehold(household.id)).then(() =>
                                setConfirmDelete(false),
                              )
                            }
                          >
                            {tf.deleteFamily}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                            {tf.cancel}
                          </Button>
                        </span>
                      ) : (
                        <Button
                          variant="ghost"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => setConfirmDelete(true)}
                        >
                          <Trash2 className="mr-2 size-4" /> {tf.deleteFamily}
                        </Button>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </>
      )}
    </PageFrame>
  )
}

function CreateFamilyForm({ busy, onCreate }: { busy: boolean; onCreate: (name: string) => void }) {
  const t = useT()
  const tf = t.family
  const [name, setName] = useState('')
  function submit(e: FormEvent) {
    e.preventDefault()
    if (name.trim()) onCreate(name.trim())
  }
  return (
    <Card>
      <CardContent>
        <p className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-foreground">
          <HomeIcon className="size-4 text-primary" /> {tf.createTitle}
        </p>
        <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="family-name">{tf.nameLabel}</Label>
            <Input
              id="family-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={tf.namePlaceholder}
              required
            />
          </div>
          <Button type="submit" disabled={busy}>
            {busy ? tf.creating : tf.create}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function InviteForm({ busy, onInvite }: { busy: boolean; onInvite: (email: string) => void }) {
  const t = useT()
  const tf = t.family
  const [email, setEmail] = useState('')
  function submit(e: FormEvent) {
    e.preventDefault()
    if (email.trim()) {
      onInvite(email.trim())
      setEmail('')
    }
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="invite-email">{tf.inviteEmailLabel}</Label>
        <Input
          id="invite-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="parent@example.com"
          required
        />
      </div>
      <Button type="submit" disabled={busy}>
        {busy ? tf.inviting : tf.invite}
      </Button>
    </form>
  )
}

import { useState, type FormEvent } from 'react'
import { Users, UserPlus, Home as HomeIcon, Mail, Check, X, Share2, LogOut, Pencil, Trash2 } from 'lucide-react'
import { SectionHeader } from '../components/SectionHeader'
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
import { useT } from '../i18n'

export default function Family() {
  const t = useT()
  const tf = t.family
  const { ready, loading, household, members, invites, pending, refresh } = useHousehold()
  const { session } = useSession()
  const myId = session?.user?.id
  const isOwner = Boolean(household && household.created_by === myId)
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
    <>
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
        <SectionHeader title={tf.title} description={tf.subtitle} />

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
                        <Button size="sm" disabled={busy === inv.id} onClick={() => void run(inv.id, () => acceptInvite(inv.id))}>
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
                        className="mb-4 flex items-center gap-2"
                      >
                        <Input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} autoFocus />
                        <Button type="submit" size="sm" disabled={busy === 'rename'}>
                          {tf.save}
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => setEditingName(false)}>
                          {tf.cancel}
                        </Button>
                      </form>
                    ) : (
                      <div className="mb-1 flex items-center gap-2">
                        <p className="flex items-center gap-2 text-lg font-semibold text-foreground">
                          <HomeIcon className="size-5 text-primary" /> {household.name}
                        </p>
                        <button
                          type="button"
                          aria-label={tf.rename}
                          onClick={() => {
                            setNameDraft(household.name)
                            setEditingName(true)
                          }}
                          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                        >
                          <Pencil className="size-3.5" />
                        </button>
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
                              <button
                                type="button"
                                aria-label={tf.remove}
                                onClick={() => void run(m.id, () => removeMember(m.id))}
                                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                              >
                                <X className="size-4" />
                              </button>
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
                              <button
                                type="button"
                                onClick={() => void run(inv.id, () => deleteInvite(inv.id))}
                                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                              >
                                <X className="size-3.5" /> {tf.revoke}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Share + leave */}
                <Card>
                  <CardContent className="flex flex-col gap-4">
                    <div>
                      <Button
                        variant="secondary"
                        disabled={busy === 'share'}
                        onClick={() => void run('share', () => shareOwnedBabies(household.id))}
                      >
                        <Share2 className="mr-2 size-4" /> {tf.shareBabies}
                      </Button>
                      <p className="mt-2 text-xs text-muted-foreground">{tf.shareBabiesNote}</p>
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
                          <span className="flex items-center gap-2 text-sm">
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
      </main>
    </>
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

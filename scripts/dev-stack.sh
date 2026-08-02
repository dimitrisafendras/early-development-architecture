#!/usr/bin/env bash
#
# The local development stack: Docker → Supabase → seeded data → the test suite.
#
# Everything here is local and disposable. `supabase/seed.sql` builds the same
# two-parent household with the same two children every time, so a failing test
# describes the code rather than whatever data happened to be lying around.
#
#   ./scripts/dev-stack.sh up      # Docker + Supabase, seeded (idempotent)
#   ./scripts/dev-stack.sh reset   # re-apply migrations + seed, wiping data
#   ./scripts/dev-stack.sh test    # up, then the Playwright suite
#   ./scripts/dev-stack.sh dev     # up, then the app pointed at the local stack
#   ./scripts/dev-stack.sh status  # what is running, and the fixture accounts
#   ./scripts/dev-stack.sh down    # stop Supabase (leaves Docker running)
#
# ## The two things that are easy to get wrong
#
# **Ports.** This stack runs on 544xx, not the Supabase defaults (5432x). A
# second local Supabase project on the same machine holds the defaults and
# `supabase start` refuses to share them rather than failing over. The offsets
# live in `supabase/config.toml`; this script reads them back from the CLI
# rather than repeating them.
#
# **`.env.local` is never touched.** It holds the *hosted* project's URL and
# key, and pointing it at localhost would silently mean the next `npm run dev`
# talked to a database that vanishes on `down`. Vite gives inline `VITE_*`
# environment variables priority over `.env.local`, so the local credentials are
# exported for the child process only and disappear with it.
set -euo pipefail

cd "$(dirname "$0")/.."

log()  { printf '\033[1;34m▸\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m!\033[0m %s\n' "$*"; }
die()  { printf '\033[1;31m✗\033[0m %s\n' "$*" >&2; exit 1; }

# --- Docker ----------------------------------------------------------------

ensure_docker() {
  if docker info >/dev/null 2>&1; then
    log "Docker already running."
    return
  fi
  [ -d "/Applications/Docker.app" ] || die "Docker Desktop is not installed — https://docs.docker.com/desktop/"
  log "Starting Docker Desktop…"
  open -a Docker
  # Docker Desktop reports itself long before the daemon accepts connections,
  # so poll the daemon rather than the app.
  for _ in $(seq 1 60); do
    if docker info >/dev/null 2>&1; then log "Docker ready."; return; fi
    sleep 2
  done
  die "Docker did not become ready within two minutes."
}

# --- Supabase --------------------------------------------------------------

supabase_running() {
  supabase status >/dev/null 2>&1
}

ensure_supabase() {
  command -v supabase >/dev/null 2>&1 || die "The Supabase CLI is missing — \`brew install supabase/tap/supabase\`."
  if supabase_running; then
    log "Supabase stack already up."
    return
  fi
  log "Starting the Supabase stack (first run pulls images — this takes a while)…"
  supabase start
}

# `supabase status -o env` is the only source for these; hard-coding them here
# would be a second copy of config.toml waiting to drift.
load_env() {
  eval "$(supabase status -o env 2>/dev/null | grep -E '^(API_URL|ANON_KEY)=')"
  [ -n "${API_URL:-}" ] || die "Could not read the local API URL — is the stack up?"
  export VITE_SUPABASE_URL="$API_URL"
  export VITE_SUPABASE_ANON_KEY="$ANON_KEY"
}

# Playwright's `reuseExistingServer` adopts whatever is already on 5173 — and a
# dev server started by hand carries `.env.local`, i.e. the *hosted* project. The
# suite would then run green against production data while this script reported
# it had tested the local stack. Restarting costs a second; being wrong about
# which database was under test does not announce itself at all.
free_dev_port() {
  local pids
  pids="$(lsof -ti:5173 2>/dev/null || true)"
  [ -n "$pids" ] || return 0
  warn "A dev server is already on :5173 — restarting it so it picks up the local stack."
  # shellcheck disable=SC2086
  kill $pids 2>/dev/null || true
  for _ in $(seq 1 20); do
    lsof -ti:5173 >/dev/null 2>&1 || return 0
    sleep 0.5
  done
  die "Could not free port 5173."
}

print_accounts() {
  cat <<'ACCOUNTS'

  Fixture accounts (local stack only — see supabase/seed.sql):
    parent@example.test  / devpassword   owner, both children
    partner@example.test / devpassword   invited co-parent, sees the same data

  Children: Iris (4 months, tummy time) and Theo (16 months, active play) —
  deliberately one on each side of the first birthday, where the app changes
  what it measures.
ACCOUNTS
}

# --- Commands --------------------------------------------------------------

cmd_up() {
  ensure_docker
  ensure_supabase
  # A stack that is up but empty is the confusing state: the app signs in
  # against it and every screen is blank. Seed if the fixtures are missing.
  if ! docker exec "supabase_db_$(grep -m1 '^project_id' supabase/config.toml | cut -d'"' -f2)" \
        psql -U postgres -tAc "select 1 from auth.users where email = 'parent@example.test'" 2>/dev/null | grep -q 1; then
    log "No fixture data found — seeding."
    supabase db reset
  fi
  cmd_status
}

cmd_reset() {
  ensure_docker
  ensure_supabase
  warn "Wiping the local database and re-applying migrations + seed."
  supabase db reset
  log "Reset complete."
}

cmd_down() {
  supabase stop
  log "Supabase stopped. Docker is left running."
}

cmd_status() {
  supabase status
  print_accounts
}

cmd_dev() {
  cmd_up
  load_env
  log "Dev server against $VITE_SUPABASE_URL (\`.env.local\` untouched)."
  npm run dev
}

cmd_test() {
  ensure_docker
  ensure_supabase
  load_env
  free_dev_port
  # Braced: an unbraced `$VAR` directly followed by a multibyte character (the
  # ellipsis) has that character's bytes read as part of the variable name.
  log "Running the Playwright suite against ${VITE_SUPABASE_URL}…"

  if npx playwright test "$@"; then
    log "Suite green."
    return 0
  fi

  # A failing run on this stack is more often the host than the code: the suite
  # launches two browser projects across seven workers beside a Docker VM, and
  # under load the failures are `page.goto`/`browserType.launch` timeouts that
  # land on a *different* set of tests every run. Retrying only the failures is
  # how you tell the two apart — a real regression fails again, a starved run
  # goes green in seconds.
  warn "Failures on the first pass. Retrying just those, serially, to separate"
  warn "regressions from host-load timeouts…"
  if npx playwright test --last-failed --workers=2; then
    warn "Everything passed on retry — those were load flakes, not regressions."
    warn "Close other heavy applications if this keeps happening."
    return 0
  fi
  die "Failures survived the retry. These are real."
}

case "${1:-up}" in
  up)     cmd_up ;;
  reset)  cmd_reset ;;
  down)   cmd_down ;;
  status) cmd_status ;;
  dev)    cmd_dev ;;
  test)   shift; cmd_test "$@" ;;
  *)      die "Unknown command '$1'. One of: up, reset, down, status, dev, test." ;;
esac

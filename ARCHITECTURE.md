# Architecture — Pelada App

> **Status:** canonical architecture document. It currently lives in the proletarias API (authored by the Architect, project `pelada`) because the repository does not exist yet. **It MUST be migrated verbatim to `ARCHITECTURE.md` at the repo root during project bootstrap (task `bootstrap-projeto`).** All code, comments and documentation in this project are written in **English**. Portuguese is used only for proletarias agent/CEO communication.

## 1. Overview

The Pelada App is a single-admin Progressive Web App (PWA) to manage informal football groups ("peladas"): players, matches, team draws, payments and a shared cash box ("caixinha"). It is installed on a phone, runs at zero hosting cost, and talks directly to a Neon PostgreSQL database from the browser. There is no backend server.

- **Type:** installable PWA (offline app shell via service worker; data operations require connectivity).
- **Hosting:** GitHub Pages (public repo, static build).
- **Database:** Neon PostgreSQL via `@neondatabase/serverless` (HTTP/WS, direct from the browser).
- **Auth model:** on each cold start the admin types the database password; the connection string is built **in memory** and kept in `sessionStorage` (cleared on close). No secret ever touches the repo or the build.
- **Tenancy:** every row is scoped to a `profile` (each profile is an isolated pelada world).

## 2. Stack

TypeScript · React · Vite · vite-plugin-pwa · `@neondatabase/serverless` · Vitest · React Testing Library · ESLint + typescript-eslint.

## 3. Layered Architecture (Ports & Adapters)

Dependencies always point **inward**. The domain knows nothing about React, the database, the clock or randomness.

```
src/
├── domain/            # Pure TS. No React, no DB, no I/O, no Date.now(), no Math.random()
│   ├── entities/      # Player, Pelada, Team, ...
│   ├── value-objects/ # Money (integer cents), Stars, SlotType, Position, Speed
│   └── services/      # TeamDrawService, BalanceCalculator, SubcaixinhaBalancer, message builders
├── application/       # Use cases (orchestration). Depends only on ports.
│   └── use-cases/
├── ports/             # Interfaces (contracts) — the heart of DI
│   ├── repositories/  # ProfileRepository, PlayerRepository, PeladaRepository, ...
│   ├── RandomSource.ts
│   ├── Clock.ts
│   └── SqlExecutor.ts
├── infrastructure/    # Adapters implementing the ports
│   ├── db/            # NeonSqlExecutor, PgSqlExecutor, SQL repositories
│   ├── random/        # SystemRandomSource, SeededRandomSource
│   └── clock/         # SystemClock, FixedClock
├── ui/                # React components; consume services via Context/hooks
└── composition-root.ts
```

**Rules (enforced in code review):**
- No business logic in React components.
- No DB calls in the domain.
- Components receive use cases/services through React Context; they never instantiate adapters.
- The composition root is the only place that wires concrete adapters.

**DI mechanism:** hand-written composition root + React Context (fully typed, no reflection). No DI container library.

## 4. Decision Records

### ADR-1 — Randomness is an injected port
The team draw uses randomness, which must be fully testable. `Math.random()` MUST NOT appear in the domain. Instead, the domain depends on `RandomSource`:

```ts
export interface RandomSource {
  // Returns an integer in [0, maxExclusive).
  nextInt(maxExclusive: number): number;
  // Returns a new shuffled copy (Fisher-Yates) without mutating input.
  shuffle<T>(items: readonly T[]): T[];
}
```
- Production: `SystemRandomSource` (`crypto.getRandomValues`/`Math.random`).
- Tests: `SeededRandomSource` (fixed seed → deterministic) or a scripted stub.

`TeamDrawService.draw(players, config, random, strategy)` is a pure function. Every requirement scenario becomes a deterministic test.

### ADR-2 — Balancing strategy is a single injected object
The requirement demands the "total vs average" criterion for stars/speed be **identical** in the draw algorithm and in the result display. This is encapsulated in an injected `BalancingStrategy`, consumed by both — impossible to diverge.

### ADR-3 — "Now" is an injected Clock
The "Comunicação da Caixinha" shows records from the last 3 weeks plus any future-dated records. Time is injected via `Clock` (`SystemClock` in prod, `FixedClock` in tests) so the window is deterministically testable.

### ADR-4 — Money is integer cents, never float
`Money` is a value object holding an integer number of cents; persisted as `numeric`/`bigint`. This eliminates floating-point drift in the cash box and in the subcaixinha "delta = 0" rule.

### ADR-5 — Integration tests run on Docker Postgres, never on Neon
Integration tests run against an **ephemeral PostgreSQL 16 container** (docker-compose) — never against the real shared Neon database. Rationale: total isolation (zero risk to the CEO's shared DB), zero cost, offline, reproducible locally and in CI.

The transport is abstracted behind the `SqlExecutor` port so the same repository code runs against either backend:
- Production: `NeonSqlExecutor` (serverless driver, HTTP/WS).
- Tests: `PgSqlExecutor` (`node-postgres`) pointing at the Docker Postgres.
- Optional (max fidelity): add a `local-neon-http-proxy` container to exercise the exact serverless driver locally. Not required, since the SQL is identical (Neon IS Postgres).

### ADR-6 — Deletion strategy (referential integrity)
Three distinct behaviors:

1. **Pelada → hard delete with CASCADE.** Deleting a pelada removes everything that exists only because of it:
   ```
   peladas (DELETE)
     └─CASCADE→ pelada_teams      (its team names)
     └─CASCADE→ pelada_players    (its roster + payment toggles)
     └─CASCADE→ draw_assignments  (its drawn teams)
   ```
   It does NOT touch `players`, `financial_records` or `subcaixinhas`.
   **Critical nuance:** a pelada's payment toggle (`pelada_players.paid`) is NOT the Financial module. The payment checklist is fully decoupled from the cash box, so deleting a pelada deletes its payment toggles but never creates or removes any `financial_records` row.
2. **Player → soft delete (inactivation).** Players are NEVER hard-deleted; the "delete" button sets `status = inactive`. This preserves history (old rosters/draws reference the player; the `invited_by_id` self-reference stays valid). Inactive players disappear from the match-building search but remain in the CRUD for reactivation.
3. **Profile → catastrophic hard delete with full CASCADE.** The profile is the tenant root; deleting it cascades everything beneath (players, peladas and their children, financial_records, subcaixinhas, template). The UI requires reinforced confirmation (type "deletar").

`ON DELETE CASCADE` lives in the DDL so integrity holds at the database level even if the application errs. Integration tests MUST prove both the cascade and the non-cascade of the financial module.

## 5. Data Model

Tenant boundary = `profiles`. Everything is scoped by `profile_id`.

| Table | Key columns | Notes |
|---|---|---|
| `profiles` | id, name, convocation_template, created_at | Tenant root |
| `players` | id, **profile_id**, name, nickname, phone, stars `numeric(2,1)`, position, speed, default_type (line/goalkeeper), **invited_by_id** → players, **status** (active/inactive) | Soft delete via `status` |
| `peladas` | id, **profile_id**, date, time, location, players_per_team, max_goalkeepers, cost_per_player, goalkeeper_pays | |
| `pelada_teams` | id, **pelada_id**, name, sort_order | Team names define team count |
| `pelada_players` | id, **pelada_id**, **player_id**, slot_type (line/goalkeeper), **paid** bool | Roster + payment toggle |
| `draw_assignments` | id, **pelada_id**, **pelada_team_id**, **player_id** | Current draw; rewritten each draw |
| `financial_records` | id, **profile_id**, date, description, value (cents), type (credit/debit) | Independent of peladas |
| `subcaixinhas` | id, **profile_id**, name, goal `nullable` (cents), current_value (cents) | |

Money columns store integer cents. FKs declare `ON DELETE CASCADE` per ADR-6.

## 6. Domain Behavior Summary
- **Team draw:** balance by stars (primary), tie-break by position then speed; goalkeepers in the draw only when `#goalkeepers == #teams`; distribute as evenly as possible when under capacity (e.g. 14→5/5/4, 13→5/4/4). Each draw replaces the previous one.
- **Financial:** month balance, general balance, previous balance (relative to a selected set, used by the cash-box message).
- **Subcaixinhas:** delta = total of subcaixinhas vs total cash box; save only when delta == 0; allocation popup offers 10/25/50/75/100% of a positive delta.
- **Messages:** convocation (template + `{{data}}`/`{{hora}}`/`{{local}}`/`{{custo}}` placeholders), drawn teams (🧤/⚽, no internal stats), payment checklist (✅/❌, alphabetical), cash-box communication.

## 7. Testing Strategy
- **Unit (Vitest, zero I/O):** the bulk of coverage — all domain services and use cases, with mocked ports (`SeededRandomSource`, `FixedClock`, fake repositories). Exhaustive scenarios for the draw, financial math, subcaixinha rules, message builders, validations.
- **Integration (Vitest + Docker Postgres 16):** repository adapters; proves CRUD and the deletion strategy (cascade + financial non-cascade). Never touches Neon.
- **Component (React Testing Library):** behavior of key screens with mocked services.
- **TypeScript** is the first line of defense: an unpropagated field change breaks compilation before any test runs.

## 8. Coding Standards (summary → `CODING_STANDARDS.md`)
- All code, comments and docs in English.
- DI by interface at every I/O boundary (DB, randomness, clock).
- Composition over inheritance; inheritance only for genuine "is-a".
- Concentrate null/sanity checks at edge layers (external input), not scattered.
- Short methods; doc comment on every public method; methods ordered alphabetically within a class; clear English names.
- TDD: write tests before implementation in every micro-task.
- Money in integer cents; never float for money.

## 9. Pending CTO Ratification (out of Architect's stack scope)
1. Migration/data-access tooling under the `SqlExecutor` port (raw SQL + light migration runner, or Drizzle with Neon/pg adapters).
2. `local-neon-http-proxy` in tests (driver parity) — yes/no.
3. (Resolved by CEO) DI: hand-written composition root, no container library.

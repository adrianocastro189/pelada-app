# Pelada App

A single-admin Progressive Web App (PWA) for managing informal football groups
("peladas"): players, matches, team draws, payments, and a shared cash box ("caixinha").

Installed on a phone from the browser — works like a native app. Connects directly
to a Neon PostgreSQL database; no backend server required.

## Stack

TypeScript · React · Vite · vite-plugin-pwa · Neon (`@neondatabase/serverless`) ·
Vitest · React Testing Library · ESLint + typescript-eslint

## Getting Started

### Install dependencies

```bash
npm install
```

### Run dev server

```bash
npm run dev
```

### Lint

```bash
npm run lint
```

### Build

```bash
npm run build
```

## Testing

### Unit tests (run on every change — TDD mandatory)

```bash
npm run test
```

Unit tests run entirely in memory (zero I/O). They cover all domain services, use cases,
and validations using mocked ports (`SeededRandomSource`, `FixedClock`, fake repositories).

### Integration tests (requires Docker Postgres 16)

```bash
npm run test:integration
```

Integration tests run against an ephemeral PostgreSQL 16 container — **never** against
the real Neon database. See [ARCHITECTURE.md](./ARCHITECTURE.md) ADR-5 for the rationale
and Docker setup instructions.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full reference:

- Layer boundaries and dependency rules (Ports & Adapters)
- Architecture Decision Records (ADRs)
- Full data model
- Testing strategy
- Coding standards summary

## TDD Policy

**TDD is mandatory from the very first line of feature code.** Write the test before
the implementation in every micro-task. Unit tests are the highest priority in this
project. No feature code is accepted without a corresponding test.

See [CODING_STANDARDS.md](./CODING_STANDARDS.md) for the full coding standards.

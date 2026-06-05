# Coding Standards — Pelada App

> Derived from Section 8 of [ARCHITECTURE.md](./ARCHITECTURE.md). Exists as a standalone
> reference for contributors and for automated tooling. If this document conflicts with
> `ARCHITECTURE.md`, `ARCHITECTURE.md` is the authority — update both together.

---

## Language

All code, comments, and documentation must be written in **English**. This includes:

- Variable names, function names, class names, interface names
- SQL column names and table names
- JSDoc/TSDoc comments and all inline comments
- Commit messages and PR descriptions

Portuguese is used only for proletarias agent/CEO communication, not for anything
committed to the repository.

---

## Test-Driven Development (TDD)

**TDD is mandatory.** Write the test before the implementation in every micro-task.
Unit tests are the highest priority. No feature code is accepted without a corresponding
test. The red → green → refactor cycle applies to every change.

---

## Dependency Injection

Use **interfaces (ports) at every I/O boundary**: database, randomness, and clock.
Concrete adapters implement these interfaces and are wired together in the
`composition-root.ts` only. The domain and application layers never import adapters
directly.

```
✅ domain/services/TeamDrawService.ts  →  depends on RandomSource (port)
❌ domain/services/TeamDrawService.ts  →  imports SystemRandomSource (adapter)
```

---

## Object-Oriented Design

Prefer **composition over inheritance**. Favour small, focused objects that delegate
to collaborators. Inheritance is acceptable only for genuine "is-a" relationships —
if in doubt, compose.

---

## Null and Sanity Checks

Concentrate null checks and input validation at **edge layers** (user input, external
API responses, database reads). Do not scatter defensive checks throughout the domain
or application layers — trust internal invariants established at the boundary.

---

## Method Design

- **Short and focused:** each method has a single responsibility. If you need "and"
  to describe what a method does, split it.
- **Doc comment on every public method:** describe what it receives, what it returns,
  and any important edge cases or invariants. One-liners are fine; verbose prose is
  not required.
- **Alphabetical ordering within a class:** methods are ordered alphabetically within
  a class or interface. This makes navigation predictable regardless of IDE.
- **Clear English names:** prefer `calculateMonthBalance` over `calcBal`.
  Abbreviations are acceptable only when they are universally understood in context.

---

## Money

**Never use `number` (float) for monetary values.** The `Money` value object stores
integer **cents**. All monetary database columns use `numeric` or `bigint`. This
eliminates floating-point drift and makes equality checks (including the subcaixinha
"delta = 0" rule) reliable.

```ts
// ✅ Correct
const value: number = 1050  // 10.50 BRL in integer cents

// ❌ Wrong
const value: number = 10.5  // floating-point — do not use for money
```

---

## Type Safety

TypeScript strict mode is the **first line of defence**. An unpropagated field addition
or removal breaks compilation before any test runs. Leverage this:

- Do not cast to `any` without explicit justification and a tracked issue.
- Do not use `// @ts-ignore` or `// @ts-expect-error` without a comment explaining why.
- Prefer narrowing and type guards over assertions (`as Type`).

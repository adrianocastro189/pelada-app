# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Project scaffold: Vite + React + TypeScript (`react-ts` template)
- Layered architecture folder structure (domain / application / ports / infrastructure / ui)
- Path aliases (`@domain/*`, `@application/*`, `@ports/*`, `@infrastructure/*`, `@ui/*`)
- Port interfaces: `RandomSource`, `Clock`, `SqlExecutor`
- ESLint + typescript-eslint configured in strict mode
- TypeScript strict mode enabled
- Vitest + React Testing Library configured; scripts: `test`, `test:integration`, `lint`, `build`, `dev`
- vite-plugin-pwa skeleton (name "Pelada App", theme `#1B6B3A`)
- Smoke unit test (verifies the test runner is functional)
- Smoke component test (renders `<App />` with React Testing Library)
- Architecture doc, test tooling
- `README.md` — overview, stack, install/run/test instructions, TDD policy
- `ARCHITECTURE.md` — canonical architecture document (verbatim from Architect)
- `CODING_STANDARDS.md` — standalone coding standards reference

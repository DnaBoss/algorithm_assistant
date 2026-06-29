# Engineering Standards

This document defines the baseline engineering rules for ExactlyOne.

## Architecture Principles

- Server-side services must be written in Rust. Node is only allowed for the
  frontend toolchain, build scripts, or one-off local utilities.
- Keep domain logic, persistence, transport, and UI operations separated.
- Prefer small, explicit modules over large files that mix business rules,
  network calls, rendering, and side effects.
- Public UI, public docs, and API responses must not expose private planning
  notes, internal prompts, local paths, secrets, or deployment credentials.

## Design Patterns

Use design patterns when they make boundaries clearer, not as decoration.

- Repository pattern: isolate database reads and writes behind a storage
  boundary.
- Service pattern: put business rules in service modules instead of route
  handlers or UI components.
- Adapter pattern: hide replaceable integrations such as media storage, auth,
  external APIs, deployment targets, or future shared content systems.
- DTO / mapper pattern: translate between database rows, API payloads, and UI
  models explicitly.
- Command pattern: model admin operations, migrations, imports, and long-running
  jobs as named commands with clear inputs and outputs.
- State reducer pattern: use reducers or focused state helpers when frontend UI
  state becomes multi-step or branch-heavy.

Avoid patterns that add indirection without reducing real complexity.

## Separation Of Logic And Operations

- Route handlers should validate inputs, call services, and map errors. They
  should not contain core business logic.
- Database code should live behind repository functions or modules, not inside
  UI components.
- UI components should render state and dispatch actions. Data fetching,
  persistence, and transformation should live in API/client/helper modules.
- Long-running jobs should have resumable steps, logs, and idempotent behavior
  where practical.
- Configuration must come from environment variables or typed config objects.
  Do not scatter `env` reads throughout application logic.

## Testing Requirements

Every meaningful change needs tests proportional to risk.

- Unit tests for pure logic, mappers, validators, reducers, and formatting.
- Repository or integration tests for migrations, queries, permissions, and
  transaction behavior.
- API tests for auth, validation errors, public/private data boundaries, and
  admin workflows.
- Frontend tests for critical rendering, filters, editor state, and API fallback
  behavior.
- Browser verification for user-facing UI changes on desktop and mobile width.
- Regression tests for every fixed bug that could return.

Minimum checks before handoff:

```bash
npm run lint
npm run test
npm run build
npm run build:api
```

When a change touches Rust backend behavior, add or update Rust tests and run:

```bash
cargo test --manifest-path server/Cargo.toml
```

When a change touches frontend logic, add or update Vitest tests for pure
helpers, state reducers, mappers, or API clients. Use browser verification for
visible UI and admin workflows.

## Refactoring Rules

- Refactor toward boundaries that make tests easier to write.
- Keep behavior-preserving refactors separate from feature changes when the
  change is large.
- Do not move unrelated code merely to make files look tidy.
- Do not rewrite large data files unless the task is a data migration or content
  expansion.

## Skill Usage For AI Agents

AI agents working in this repository should use relevant Codex skills when the
task matches them:

- `browser:control-in-app-browser`: verify local UI, admin flows, responsive
  layout, and browser behavior.
- `github:github`: inspect repository, pull request, or issue context.
- `github:gh-fix-ci`: diagnose and fix failing GitHub Actions checks.
- `github:gh-address-comments`: address pull request review feedback.
- `github:yeet`: publish a branch, push, and open a draft pull request.
- `openai-docs`: answer or implement against current OpenAI product/API docs.
- `skill-creator`: create or update a reusable Codex skill when a workflow
  becomes repeated and specialized.
- `plugin-creator`: create a local Codex plugin only when a plugin is explicitly
  needed.

If a needed skill is unavailable, continue with the best local fallback and
record that limitation in the handoff.

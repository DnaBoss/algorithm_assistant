# Git Development Flow

This repository uses `develop` as the integration branch for all normal development.
Do not develop directly on `main` or `develop`.

## Branch roles

- `main`: stable release branch. Only merge verified release work from `develop`.
- `develop`: integration branch. New work starts here and merges back here.
- `codex/<topic>` or `feature/<topic>`: short-lived development branches.

## Standard workflow

Start every change from an up-to-date `develop`:

```bash
git switch develop
git pull --ff-only origin develop
git switch -c codex/<short-topic>
```

Make the code change, then run the project checks before committing:

```bash
npm run lint
npm run build
```

Commit with a focused message that describes the change:

```bash
git add <changed-files>
git commit -m "feat: add problem search filters"
```

Merge the branch back into `develop` only after the checks pass:

```bash
git switch develop
git pull --ff-only origin develop
git merge --no-ff codex/<short-topic>
```

Push `develop` when the merge is ready to share:

```bash
git push origin develop
```

## Commit message style

Use a small, specific subject line. Prefer these prefixes:

- `feat:` user-facing feature
- `fix:` bug fix
- `docs:` documentation-only change
- `refactor:` code change without behavior change
- `test:` test or verification update
- `chore:` tooling, dependency, or maintenance change

Examples:

```text
feat: add rating filters to problem bank
fix: preserve selected track after search reset
docs: document git development flow
```

## Release to main

When `develop` is ready for release:

```bash
git switch main
git pull --ff-only origin main
git merge --no-ff develop
npm run lint
npm run build
git push origin main
```

Create a tag only for a named release:

```bash
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0
```

## Current repository baseline

At the time this flow was introduced, the repository only had `main` and
`origin/main`. The `develop` branch should be kept as the default integration
branch going forward.

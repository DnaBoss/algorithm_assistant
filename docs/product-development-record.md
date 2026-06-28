# Product Development Record

This document is the durable planning log for the site. Keep it updated after
each meaningful feature branch so the next development session can continue
from the current product shape instead of scattered notes.

## Product Direction

The site is moving from a standalone algorithm practice lab into a personal
knowledge site. Algo Lab remains a major section, but the home page should
become the personal blog and index for writing, projects, study notes, resume,
calendar, todos, and developer tools.

The public product must feel like a personal site built with care. Do not expose
internal planning notes, development chores, or wording that makes the site look
operationally improvised.

## Primary Areas

### Blog

- Home page becomes the blog front page.
- Posts support create, edit, delete, draft, publish, and update timestamps.
- Post categories include study, work, graduate-school prep, side projects, and
  algorithm notes.
- Posts should support Markdown content, headings, code blocks, links, images,
  and concise metadata.
- Public readers can reply to posts in the first version.
- Readers can leave lightweight reactions such as like, useful, inspired,
  thoughtful, or similar mood signals.
- Admin can moderate replies and reactions if abuse appears.

### Algo Lab

- Algo Lab becomes one section under the wider personal site.
- Existing tutorials remain searchable and interactive.
- Every problem needs a place for personal thoughts, insights, traps, variants,
  and review notes.
- Problem pages can later connect to branches such as:
  - LeetCode Blind 75.
  - LeetCode Top 150.
  - Ranking-point based selection.
  - Data structure and technique paths.
  - SQL and database dry-runs.

### Identity And Admin

- The owner needs username and password login.
- Initial admin credentials must be created through a seed script or environment
  variables, not hard-coded into source control.
- Admin can change password.
- TOTP two-factor authentication is optional per admin account.
- Public users can reply before account registration is required.
- Future phone verification should fit into the user model without rewriting
  replies and reactions.

### Resume

- Add a resume section in timeline form.
- Future input sources may include LinkedIn and CakeResume PDF.
- Resume data should be structured so the UI can render work, education,
  projects, skills, certificates, and milestones.

### Calendar And Todo

- Add a calendar and todo section for personal planning.
- Todo items support Markdown.
- Tasks should support status, due date, priority, tags, and links to posts or
  projects.

### Easy PG

- Integrate the existing database mini tool as a section named Easy PG.
- Do not expose the old `rust-db-mini` name in the product UI.
- Easy PG should eventually support schema browsing, query notes, and database
  learning workflows from inside the personal site.

## Data And Infrastructure Direction

Preferred direction: self-hosted Docker services on the existing GCP VM.

Initial target stack:

- Frontend: React app served by Nginx.
- API: backend service behind Nginx, exact framework to be decided before
  implementation.
- Database: PostgreSQL in Docker with a named volume.
- Optional cache/session store: add only when needed.
- Backups: scheduled PostgreSQL dumps before accepting important production
  content.

PostgreSQL should be the source of truth for:

- Blog posts.
- Comments.
- Reactions.
- Admin users.
- TOTP setup state.
- Algo personal notes.
- Resume timeline.
- Todo/calendar items.
- Easy PG saved metadata, if needed.

## Draft Data Model

This is not final schema, but it defines the first backend shape.

- `users`: id, display name, role, password hash, phone, phone verified flag,
  created time, updated time.
- `admin_security`: user id, totp enabled flag, totp secret, recovery metadata,
  password changed time.
- `posts`: id, slug, title, excerpt, body markdown, status, category, tags,
  published time, created time, updated time.
- `comments`: id, post id, optional user id, display name, body markdown,
  status, parent comment id, created time.
- `reactions`: id, target type, target id, reaction type, optional user id,
  anonymous fingerprint hash, created time.
- `tutorial_notes`: id, tutorial id, title, body markdown, status, created time,
  updated time.
- `resume_items`: id, kind, title, organization, start date, end date, body
  markdown, tags, sort order.
- `tasks`: id, title, body markdown, status, priority, due time, scheduled time,
  tags, created time, updated time.
- `easy_pg_connections`: id, display name, encrypted connection metadata,
  created time, updated time.

## Security Notes

- Never commit real passwords, TOTP secrets, private keys, database passwords,
  or production connection strings.
- Passwords must be hashed with a modern password hashing algorithm.
- TOTP secrets must be stored server-side only.
- Admin actions need authenticated API routes.
- Anonymous replies need rate limiting or moderation before the site becomes
  public enough to attract spam.
- Database backups need restore testing, not just dump creation.

## Deployment And Cost Notes

The current static deploy itself should not materially change GCP cost. The VM
cost mostly comes from the running compute instance, disk, snapshots/backups,
and network egress. Rebuilding and uploading a static bundle is usually a tiny
cost compared with keeping the VM online.

When Docker, PostgreSQL, and backups are added, costs and operational risk rise
mostly through:

- Persistent disk size.
- Backup storage.
- More CPU and memory pressure on the VM.
- Network traffic if media files become large.

Development cadence:

- Use local preview for small UI/content iterations.
- Merge and deploy documentation-only changes only when useful.
- Deploy production for complete feature slices, schema changes, security fixes,
  and content releases that need to be visible.
- Before database migrations, create a backup and record the migration in this
  file.

## Milestone Plan

### M0: Planning Foundation

- Create durable product development record.
- Create current architecture record.
- Add README links to the planning docs.

Status: in progress.

### M1: Site Shell

- Rename product direction from standalone Algo Lab to personal site with Algo
  Lab as a section.
- Build blog-first home page.
- Keep Algo Lab accessible as a clear section.
- Add navigation for Blog, Algo Lab, Resume, Calendar, Todo, and Easy PG.

Status: not started.

### M2: Backend And Database

- Choose backend framework.
- Add Docker Compose for API and PostgreSQL.
- Add database migrations.
- Add seed flow for the first admin account through environment variables.
- Add local dev setup docs.

Status: not started.

### M3: Blog Admin

- Add admin login.
- Add create, edit, delete, draft, publish for posts.
- Add Markdown editor and preview.
- Add slug handling.
- Add password change.
- Add optional TOTP setup and verification.

Status: not started.

### M4: Public Replies And Reactions

- Add public comments on posts.
- Add reaction buttons.
- Add moderation states.
- Add rate limiting or basic anti-spam protection.

Status: not started.

### M5: Algo Personal Notes

- Add personal thought notes per existing tutorial/problem.
- Add admin editing for tutorial notes.
- Render notes on tutorial pages without mixing them into algorithm dry-run
  mechanics.

Status: not started.

### M6: Resume Timeline

- Add structured resume timeline data.
- Add admin editing.
- Add import workflow for LinkedIn and CakeResume materials once source files
  are provided.

Status: not started.

### M7: Calendar And Todo

- Add Markdown-supported tasks.
- Add calendar views.
- Add links between posts, tasks, projects, and study plans.

Status: not started.

### M8: Easy PG

- Decide integration boundary for the existing database tool.
- Rename public product surface to Easy PG.
- Add safe connection handling and saved notes.

Status: not started.

## Open Decisions

- Backend framework and language.
- Whether the blog editor is owner-only forever or later supports multiple
  trusted authors.
- Whether comments should be immediately public or held for moderation.
- Media storage location for images and PDFs.
- Backup retention period.
- Whether production should stay on one VM or move database to managed Cloud SQL
  later.

## Progress Log

### 2026-06-28

- Captured the product shift from algorithm-only site to personal knowledge
  site.
- Defined major sections: Blog, Algo Lab, Resume, Calendar, Todo, Easy PG.
- Recorded self-hosted Docker and PostgreSQL as the preferred initial
  infrastructure direction.
- Added first milestone plan and cost/deployment notes.

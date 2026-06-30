create table if not exists algo_problem_notes (
  id uuid primary key default gen_random_uuid(),
  problem_id text not null unique,
  status text not null default 'draft' check (status in ('draft', 'published')),
  title text not null,
  body jsonb not null default '[]'::jsonb,
  author_id uuid references admin_users(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists algo_problem_notes_status_idx
  on algo_problem_notes (status, updated_at desc);

create table if not exists algo_comments (
  id uuid primary key default gen_random_uuid(),
  problem_id text not null,
  parent_id uuid references algo_comments(id) on delete cascade,
  display_name text not null default '訪客',
  body text not null,
  status text not null default 'published' check (status in ('published', 'hidden')),
  created_at timestamptz not null default now()
);

create index if not exists algo_comments_problem_created_idx
  on algo_comments (problem_id, created_at);

create table if not exists algo_reactions (
  id uuid primary key default gen_random_uuid(),
  problem_id text not null,
  reaction_type text not null check (reaction_type in ('like', 'useful', 'inspired', 'thoughtful')),
  anonymous_key text not null,
  created_at timestamptz not null default now(),
  unique (problem_id, reaction_type, anonymous_key)
);

create index if not exists algo_reactions_problem_type_idx
  on algo_reactions (problem_id, reaction_type);

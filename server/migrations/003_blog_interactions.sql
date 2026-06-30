create table if not exists blog_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references blog_posts(id) on delete cascade,
  parent_id uuid references blog_comments(id) on delete cascade,
  display_name text not null default '訪客',
  body text not null,
  status text not null default 'published' check (status in ('published', 'hidden')),
  created_at timestamptz not null default now()
);

create index if not exists blog_comments_post_created_idx
  on blog_comments (post_id, created_at);

create table if not exists blog_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references blog_posts(id) on delete cascade,
  reaction_type text not null check (reaction_type in ('like', 'useful', 'inspired', 'thoughtful')),
  anonymous_key text not null,
  created_at timestamptz not null default now(),
  unique (post_id, reaction_type, anonymous_key)
);

create index if not exists blog_reactions_post_type_idx
  on blog_reactions (post_id, reaction_type);

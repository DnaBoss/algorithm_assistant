create extension if not exists pgcrypto;

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  display_name text not null,
  password_hash text not null,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft', 'published')),
  title text not null,
  excerpt text not null default '',
  category text not null default 'General',
  tags text[] not null default '{}',
  read_minutes integer not null default 3 check (read_minutes > 0),
  body jsonb not null default '[]'::jsonb,
  author_id uuid references admin_users(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_status_published_at_idx on blog_posts (status, published_at desc);
create index if not exists blog_posts_tags_idx on blog_posts using gin (tags);
create index if not exists blog_posts_body_idx on blog_posts using gin (body);

create table if not exists blog_media (
  id uuid primary key default gen_random_uuid(),
  storage_key text not null unique,
  original_name text not null,
  mime_type text not null,
  size_bytes integer not null,
  public_url text not null,
  owner_id uuid references admin_users(id) on delete set null,
  created_at timestamptz not null default now()
);

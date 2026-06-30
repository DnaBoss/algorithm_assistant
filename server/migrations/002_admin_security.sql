alter table admin_users
  add column if not exists password_changed_at timestamptz,
  add column if not exists totp_secret text,
  add column if not exists totp_enabled boolean not null default false;

update admin_users
set password_changed_at = coalesce(password_changed_at, updated_at)
where password_changed_at is null;

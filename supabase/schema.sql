create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_en text not null,
  name_hi text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  mime text not null,
  data bytea not null,
  width integer,
  height integer,
  bytes integer generated always as (octet_length(data)) stored,
  alt_text text,
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  body_html text not null,
  language text not null check (language in ('hi', 'en')),
  category_id uuid not null,
  cover_media_id uuid,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  is_featured boolean not null default false,
  is_breaking boolean not null default false,
  tags text[] not null default '{}',
  views integer not null default 0 check (views >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint articles_category_id_fkey
    foreign key (category_id) references public.categories(id) on delete restrict,
  constraint articles_cover_media_id_fkey
    foreign key (cover_media_id) references public.media(id) on delete set null
);

create index if not exists articles_published_idx
  on public.articles(status, published_at desc);

create index if not exists articles_language_published_idx
  on public.articles(language, status, published_at desc);

create index if not exists articles_featured_idx
  on public.articles(is_featured, status, published_at desc);

create index if not exists articles_breaking_idx
  on public.articles(is_breaking, status, published_at desc);

create index if not exists articles_views_idx
  on public.articles(views desc, status);

create or replace function public.set_category_updated_at()
returns trigger
language plpgsql
as $$
begin
  NEW.updated_at := now();
  return NEW;
end;
$$;

create or replace function public.set_article_updated_at()
returns trigger
language plpgsql
as $$
begin
  if NEW.views is distinct from OLD.views
     and NEW.slug = OLD.slug
     and NEW.title = OLD.title
     and NEW.excerpt is not distinct from OLD.excerpt
     and NEW.body_html = OLD.body_html
     and NEW.language = OLD.language
     and NEW.category_id = OLD.category_id
     and NEW.cover_media_id is not distinct from OLD.cover_media_id
     and NEW.status = OLD.status
     and NEW.published_at is not distinct from OLD.published_at
     and NEW.is_featured = OLD.is_featured
     and NEW.is_breaking = OLD.is_breaking
     and NEW.tags = OLD.tags
  then
    NEW.updated_at := OLD.updated_at;
  else
    NEW.updated_at := now();
  end if;
  return NEW;
end;
$$;

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_category_updated_at();

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at
before update on public.articles
for each row execute function public.set_article_updated_at();

create or replace function public.increment_article_views(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.articles
  set views = views + 1
  where id = p_id
    and status = 'published'
    and published_at is not null
    and published_at <= now();
end;
$$;

create or replace function public.upload_media(
  p_mime text,
  p_data_base64 text,
  p_width integer,
  p_height integer,
  p_alt_text text
)
returns table(id uuid, mime text, width integer, height integer, bytes integer)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  insert into public.media(mime, data, width, height, alt_text)
  values (p_mime, decode(p_data_base64, 'base64'), p_width, p_height, p_alt_text)
  returning public.media.id, public.media.mime, public.media.width,
            public.media.height, public.media.bytes;
end;
$$;

create or replace function public.get_media(p_id uuid)
returns table(mime text, data_base64 text)
language sql
security definer
set search_path = public
as $$
  select mime, encode(data, 'base64')
  from public.media
  where id = p_id;
$$;

grant usage on schema public to anon, authenticated;
grant select on public.categories to anon, authenticated;
grant select on public.articles to anon, authenticated;
revoke select on public.media from anon, authenticated;
grant select (id, mime, width, height, bytes, alt_text, created_at)
  on public.media to anon, authenticated;

grant insert, update, delete on public.categories to authenticated;
grant insert, update, delete on public.articles to authenticated;
grant insert, update, delete on public.media to authenticated;

grant execute on function public.increment_article_views(uuid) to anon, authenticated;
grant execute on function public.get_media(uuid) to anon, authenticated;
grant execute on function public.upload_media(text, text, integer, integer, text) to authenticated;

alter table public.categories enable row level security;
alter table public.articles enable row level security;
alter table public.media enable row level security;

drop policy if exists categories_public_select on public.categories;
create policy categories_public_select
on public.categories for select
to anon, authenticated
using (true);

drop policy if exists categories_authenticated_all on public.categories;
create policy categories_authenticated_all
on public.categories for all
to authenticated
using (true)
with check (true);

drop policy if exists articles_public_select on public.articles;
create policy articles_public_select
on public.articles for select
to anon, authenticated
using (
  (
    status = 'published'
    and published_at is not null
    and published_at <= now()
  )
  or auth.role() = 'authenticated'
);

drop policy if exists articles_authenticated_all on public.articles;
create policy articles_authenticated_all
on public.articles for all
to authenticated
using (true)
with check (true);

drop policy if exists media_public_select on public.media;
create policy media_public_select
on public.media for select
to anon, authenticated
using (true);

drop policy if exists media_authenticated_all on public.media;
create policy media_authenticated_all
on public.media for all
to authenticated
using (true)
with check (true);

insert into public.categories(slug, name_en, name_hi, sort_order)
values
  ('india','India','देश',1),
  ('world','World','दुनिया',2),
  ('politics','Politics','राजनीति',3),
  ('business','Business','व्यापार',4),
  ('sports','Sports','खेल',5),
  ('entertainment','Entertainment','मनोरंजन',6),
  ('technology','Technology','तकनीक',7),
  ('local','Local','शहर',8)
on conflict (slug) do update
set name_en = excluded.name_en,
    name_hi = excluded.name_hi,
    sort_order = excluded.sort_order;

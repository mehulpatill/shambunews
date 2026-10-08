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

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  name_en text,
  name_hi text,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tags add column if not exists name_en text;
alter table public.tags add column if not exists name_hi text;
update public.tags set name_en = coalesce(name_en, name), name_hi = coalesce(name_hi, name);
alter table public.tags alter column name_en set not null;
alter table public.tags alter column name_hi set not null;

create unique index if not exists tags_name_en_lower_idx on public.tags(lower(name_en));

create table if not exists public.article_tags (
  article_id uuid not null,
  tag_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (article_id, tag_id),
  constraint article_tags_article_id_fkey
    foreign key (article_id) references public.articles(id) on delete cascade,
  constraint article_tags_tag_id_fkey
    foreign key (tag_id) references public.tags(id) on delete cascade
);

create index if not exists article_tags_tag_id_idx
  on public.article_tags(tag_id);

create unique index if not exists tags_name_lower_idx
  on public.tags(lower(name));

create or replace function public.set_category_updated_at()
returns trigger
language plpgsql
as $$
begin
  NEW.updated_at := now();
  return NEW;
end;
$$;

create or replace function public.sync_article_tags(p_article_id uuid)
returns void
language sql
security invoker
set search_path = public
as $$
  update public.articles a
  set tags = coalesce((
    select array_agg(t.name_en order by t.name_en)
    from public.article_tags atg
    join public.tags t on t.id = atg.tag_id
    where atg.article_id = p_article_id
  ), '{}'::text[])
  where a.id = p_article_id;
$$;

create or replace function public.article_tags_sync_trigger()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  perform public.sync_article_tags(coalesce(NEW.article_id, OLD.article_id));
  return coalesce(NEW, OLD);
end;
$$;

drop trigger if exists article_tags_sync_after_change on public.article_tags;
create trigger article_tags_sync_after_change
after insert or update or delete on public.article_tags
for each row execute function public.article_tags_sync_trigger();

create or replace function public.tags_name_sync_trigger()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if NEW.name is distinct from OLD.name then
    update public.articles a
    set tags = array_replace(a.tags, OLD.name, NEW.name)
    where OLD.name = any(a.tags);
  end if;
  return NEW;
end;
$$;

drop trigger if exists tags_name_sync_after_update on public.tags;
create trigger tags_name_sync_after_update
after update of name on public.tags
for each row execute function public.tags_name_sync_trigger();

create or replace function public.set_article_tags(
  p_article_id uuid,
  p_tag_ids uuid[]
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  delete from public.article_tags where article_id = p_article_id;
  insert into public.article_tags(article_id, tag_id)
  select p_article_id, t.id
  from public.tags t
  where t.id = any(coalesce(p_tag_ids, '{}'::uuid[]));
  perform public.sync_article_tags(p_article_id);
end;
$$;

grant execute on function public.set_article_tags(uuid, uuid[]) to authenticated;

grant select on public.tags to anon, authenticated;
grant select on public.article_tags to anon, authenticated;
grant insert, update, delete on public.tags to authenticated;
grant insert, update, delete on public.article_tags to authenticated;

create or replace function public.set_tag_updated_at()
returns trigger
language plpgsql
as $$
begin
  NEW.updated_at := now();
  return NEW;
end;
$$;

drop trigger if exists tags_set_updated_at on public.tags;
create trigger tags_set_updated_at
before update on public.tags
for each row execute function public.set_tag_updated_at();

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
grant select on public.tags to anon, authenticated;
grant select on public.article_tags to anon, authenticated;
revoke select on public.media from anon, authenticated;
grant select (id, mime, width, height, bytes, alt_text, created_at)
  on public.media to anon, authenticated;

grant insert, update, delete on public.categories to authenticated;
grant insert, update, delete on public.articles to authenticated;
grant insert, update, delete on public.tags to authenticated;
grant insert, update, delete on public.article_tags to authenticated;
grant insert, update, delete on public.media to authenticated;

grant execute on function public.increment_article_views(uuid) to anon, authenticated;
grant execute on function public.get_media(uuid) to anon, authenticated;
grant execute on function public.upload_media(text, text, integer, integer, text) to authenticated;

alter table public.categories enable row level security;
alter table public.articles enable row level security;
alter table public.tags enable row level security;
alter table public.article_tags enable row level security;
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

drop policy if exists tags_public_select on public.tags;
create policy tags_public_select
on public.tags for select
to anon, authenticated
using (true);

drop policy if exists tags_authenticated_all on public.tags;
create policy tags_authenticated_all
on public.tags for all
to authenticated
using (true)
with check (true);

drop policy if exists article_tags_public_select on public.article_tags;
create policy article_tags_public_select
on public.article_tags for select
to anon, authenticated
using (true);

drop policy if exists article_tags_authenticated_all on public.article_tags;
create policy article_tags_authenticated_all
on public.article_tags for all
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

# Shambunews

Bilingual Hindi + English newsroom CMS built with Next.js 16 and a Supabase-compatible backend.

## Environment

Copy .env.example to .env.local and set:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- NEXT_PUBLIC_SITE_URL

The service role key is never used by the application.

## Supabase setup

Run supabase/schema.sql in the Supabase SQL editor or against the self-hosted Supabase/PostgREST database.

The schema contains:
- bilingual sections and articles
- RLS for anonymous published reads and authenticated editorial writes
- scheduled publishing support
- featured and breaking flags
- most-read view counter RPC
- Postgres-backed image media
- upload and media retrieval RPCs

Create the admin directly in Supabase Auth. Signup should remain disabled for production.

## Development

npm install
npm run dev

## Production

npm run build
npm run start

Public reads use a 5-minute Next.js revalidation window with the articles cache tag. Editorial writes invalidate that tag immediately.

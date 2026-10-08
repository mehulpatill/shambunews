# Shambhu News

Production-oriented news + blog platform built as a modular Next.js monolith.

## Included
- Responsive newspaper-style public homepage
- Featured/latest news sections
- Category pages, tags and search
- Article detail pages and related stories
- Social sharing links
- NewsArticle JSON-LD structured data
- Dynamic sitemap + robots.txt
- Admin authentication using HTTP-only signed sessions
- Admin dashboard and article list
- Create/edit/delete, draft/publish/archive and featured controls
- Category and tag management
- Website settings
- S3 presigned image upload endpoint + admin uploader
- PostgreSQL + Prisma schema
- Demo content fallback before DB is configured
- Advertising slot placeholders

## Setup
1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` and `AUTH_SECRET`.
3. Run `npm install`.
4. Run `npm run db:generate`.
5. Run `npm run db:migrate -- --name init`.
6. Run `npm run db:seed`.
7. Run `npm run dev`.

Admin: `/admin`

## Deployment
The intended app host is Vercel. PostgreSQL can remain on your EC2 server. Use TLS and restrict database network access; do not expose port 5432 to the entire internet. S3 credentials stay server-side.

## S3
Configure `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`, and `S3_PUBLIC_BASE_URL`. The admin uploader gets a short-lived presigned PUT URL from `/api/media/presign`.

## Editor
The initial editor is a robust textarea to keep the project dependency-light. It renders paragraphs, `##` headings and `>` blockquotes. Replace it with Tiptap or Lexical later for a full rich-text toolbar.

## S3 browser upload CORS

Because the admin browser PUTs directly to S3 using the presigned URL, configure the bucket CORS to allow your admin origin for `PUT` and expose `ETag`. Example (adjust origins):

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://YOUR-DOMAIN"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

## Production checklist

- Set a strong random `AUTH_SECRET`.
- Set `NEXT_PUBLIC_SITE_URL` to the canonical production URL.
- Use a dedicated PostgreSQL database for Shambhu News.
- Restrict PostgreSQL network access and require TLS.
- Give the S3 IAM identity only the bucket permissions it needs.
- Configure S3/CloudFront so uploaded images are publicly readable through the `S3_PUBLIC_BASE_URL` used by the site.
- Run the Prisma migration and seed once before the first admin login.

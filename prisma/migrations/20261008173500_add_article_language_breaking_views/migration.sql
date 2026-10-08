-- Add bilingual article support, breaking flag, and view counter.
CREATE TYPE "ArticleLanguage" AS ENUM ('EN', 'HI');

ALTER TABLE "Article"
  ADD COLUMN "language" "ArticleLanguage" NOT NULL DEFAULT 'EN',
  ADD COLUMN "isBreaking" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "views" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "Article_language_status_publishedAt_idx"
  ON "Article"("language", "status", "publishedAt");

CREATE INDEX "Article_isBreaking_status_publishedAt_idx"
  ON "Article"("isBreaking", "status", "publishedAt");

CREATE INDEX "Article_views_status_idx"
  ON "Article"("views", "status");

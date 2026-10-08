export type SiteLanguage = "en" | "hi";

export type Category = {
  id: string;
  slug: string;
  name_en: string;
  name_hi: string;
  sort_order: number;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_html: string;
  language: SiteLanguage;
  category_id: string;
  cover_media_id: string | null;
  status: "draft" | "published";
  published_at: string | null;
  is_featured: boolean;
  is_breaking: boolean;
  tags: string[];
  views: number;
  updated_at: string;
  created_at: string;
  category?: Category | null;
  cover?: {
    id: string;
    mime: string;
    width: number | null;
    height: number | null;
    bytes: number | null;
    alt_text?: string | null;
  } | null;
  tag_links?: {
    tag_id: string;
    tag?: {
      id: string;
      name: string;
      name_en: string;
      name_hi: string;
      slug: string;
    } | null;
  }[];
};

export type Media = {
  id: string;
  mime: string;
  width: number | null;
  height: number | null;
  bytes: number | null;
};

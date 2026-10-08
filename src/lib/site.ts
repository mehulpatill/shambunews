export const siteConfig = {
  name: "Shambunews",
  description: "Independent news, sharp analysis, and stories from India and beyond.",
  categories: ["India", "Politics", "Business", "World", "Technology", "Sports", "Culture"]
};

export const demoArticles = [
  {
    id: "demo-1",
    title: "India’s next growth chapter is being written beyond the metros",
    slug: "indias-next-growth-chapter",
    excerpt: "A new wave of infrastructure, digital services and smaller-city entrepreneurship is reshaping the country’s economic map.",
    featuredImage: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1400&q=80",
    status: "PUBLISHED",
    featured: true,
    publishedAt: new Date("2026-10-07T08:00:00Z"),
    author: { name: "Shambhu Desk" },
    categories: [{ category: { name: "India", slug: "india" } }],
    tags: [{ tag: { name: "Growth", slug: "growth" } }, { tag: { name: "Economy", slug: "economy" } }]
  },
  {
    id: "demo-2",
    title: "What small businesses should watch as digital payments evolve",
    slug: "small-business-digital-payments",
    excerpt: "Payments are getting faster, smarter and more embedded into everyday commerce. Here is what owners should prepare for.",
    featuredImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80",
    status: "PUBLISHED",
    featured: false,
    publishedAt: new Date("2026-10-06T10:30:00Z"),
    author: { name: "Riya Shah" },
    categories: [{ category: { name: "Business", slug: "business" } }],
    tags: [{ tag: { name: "Finance", slug: "finance" } }]
  },
  {
    id: "demo-3",
    title: "The technology shift quietly changing how newsrooms work",
    slug: "technology-shift-newsrooms",
    excerpt: "From research to distribution, modern publishing teams are rebuilding old workflows around speed and verification.",
    featuredImage: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
    status: "PUBLISHED",
    featured: false,
    publishedAt: new Date("2026-10-05T07:15:00Z"),
    author: { name: "Aman Verma" },
    categories: [{ category: { name: "Technology", slug: "technology" } }],
    tags: [{ tag: { name: "Media", slug: "media" } }]
  },
  {
    id: "demo-4",
    title: "A closer look at India’s changing urban mobility",
    slug: "indias-changing-urban-mobility",
    excerpt: "New transit links and last-mile options are changing how people move through growing cities.",
    featuredImage: "https://images.unsplash.com/photo-1567157577867-05ccb1388e2b?auto=format&fit=crop&w=1200&q=80",
    status: "PUBLISHED",
    featured: false,
    publishedAt: new Date("2026-10-04T09:00:00Z"),
    author: { name: "Shambhu Desk" },
    categories: [{ category: { name: "India", slug: "india" } }],
    tags: [{ tag: { name: "Cities", slug: "cities" } }]
  },
  {
    id: "demo-5",
    title: "Why regional stories deserve a bigger national audience",
    slug: "regional-stories-national-audience",
    excerpt: "The most important story in a country can start in a place most national desks never visit.",
    featuredImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    status: "PUBLISHED",
    featured: false,
    publishedAt: new Date("2026-10-03T12:00:00Z"),
    author: { name: "Shambhu Desk" },
    categories: [{ category: { name: "Culture", slug: "culture" } }],
    tags: [{ tag: { name: "Society", slug: "society" } }]
  }
];

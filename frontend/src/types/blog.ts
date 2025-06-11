export interface BlogPost {
  id?: string;
  _id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  status: 'draft' | 'published' | 'scheduled';
  publishDate: string;
  lastModified: string;
  featured: boolean;
  featuredImage?: string;
  categories: string[];
  tags: string[];
  seoData?: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    canonicalUrl?: string;
  };
} 
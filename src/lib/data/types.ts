/**
 * Local domain types. SDK types (BlogPost, BlogPostListItem, BlogCategory)
 * are re-exported so UI code imports everything from one place.
 */
export type {
  BlogPost,
  BlogPostListItem,
  BlogCategory,
  Tag,
  AnyBlock,
} from "@favcrm/sdk";

/** Post author — not a first-class SDK entity; sourced from post meta / seed. */
export interface Author {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string | null;
}

/** Publication identity. Demo mode reads this; live mode reads tenant config. */
export interface Brand {
  name: string;
  tagline: string;
  description: string;
  email: string;
  logoUrl: string | null;
  social: { label: string; href: string }[];
}

/** Result of a post-list query, demo and live share this shape. */
export interface PostListResult {
  items: import("@favcrm/sdk").BlogPostListItem[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Data provider — the single boundary the UI talks to for blog content.
 *
 * Demo mode (no VITE_FAVCRM_COMPANY_ID): serves the seed content in `./mock`.
 * Live mode: calls the FavCRM workspace through `@favcrm/sdk`.
 *
 * Every route loader calls these functions and never imports the SDK or the
 * mock data directly, so the two modes stay swappable.
 */
import { isLiveMode } from "$lib/config";
import { createFavCRM } from "$lib/favcrm";
import type { BlogCategory, BlogPost, PostListResult } from "./types";
import { posts, postListItems } from "./mock/posts";
import { categories as mockCategories } from "./mock/categories";

export { isLiveMode };

type FetchFn = typeof globalThis.fetch;

export interface PostQuery {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/** List published posts, filtered and paginated. */
export async function listPosts(
  fetchFn: FetchFn,
  query: PostQuery = {},
): Promise<PostListResult> {
  const limit = query.limit ?? 12;
  const page = Math.max(1, query.page ?? 1);

  if (isLiveMode()) {
    const sdk = createFavCRM(fetchFn);
    const res = await sdk.blog.list({
      category: query.category,
      search: query.search,
      page,
      limit,
    });
    const pg = res.pagination;
    return {
      items: res.items,
      total: pg.total,
      page: pg.page,
      totalPages: pg.totalPages,
      hasNext: pg.hasNext,
      hasPrev: pg.hasPrev,
    };
  }

  let items = postListItems;
  if (query.category) {
    items = items.filter((post) =>
      post.categories.some((c) => c.slug === query.category),
    );
  }
  if (query.search) {
    const needle = query.search.toLowerCase();
    items = items.filter(
      (post) =>
        post.title.toLowerCase().includes(needle) ||
        (post.excerpt ?? "").toLowerCase().includes(needle),
    );
  }
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    total,
    page,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/** Fetch a single post by slug, or null if it does not exist. */
export async function getPost(
  fetchFn: FetchFn,
  slug: string,
): Promise<BlogPost | null> {
  if (isLiveMode()) {
    const sdk = createFavCRM(fetchFn);
    try {
      return await sdk.blog.getBySlug(slug);
    } catch {
      return null;
    }
  }
  return posts.find((post) => post.slug === slug) ?? null;
}

/**
 * List categories. The SDK has no dedicated categories endpoint, so live mode
 * derives the set from recent posts.
 */
export async function listCategories(
  fetchFn: FetchFn,
): Promise<BlogCategory[]> {
  if (isLiveMode()) {
    const sdk = createFavCRM(fetchFn);
    const res = await sdk.blog.list({ limit: 100 }).catch(() => null);
    const seen = new Map<string, BlogCategory>();
    for (const post of res?.items ?? []) {
      for (const cat of post.categories) seen.set(cat.slug, cat);
    }
    return [...seen.values()];
  }
  return mockCategories;
}

/** Posts related to `post` — same category, excluding itself. */
export async function listRelatedPosts(
  fetchFn: FetchFn,
  post: BlogPost,
  limit = 3,
): Promise<PostListResult["items"]> {
  const categorySlug = post.categories[0]?.slug;
  const result = await listPosts(fetchFn, {
    category: categorySlug,
    limit: limit + 1,
  });
  return result.items.filter((p) => p.slug !== post.slug).slice(0, limit);
}

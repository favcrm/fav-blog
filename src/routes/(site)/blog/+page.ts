import { listCategories, listPosts } from "$lib/data/provider";
import type { PageLoad } from "./$types";

const PER_PAGE = 10;

export const load: PageLoad = async ({ fetch, url }) => {
  const category = url.searchParams.get("category") ?? undefined;
  const search = url.searchParams.get("q") ?? undefined;
  const page = Number(url.searchParams.get("page") ?? "1") || 1;

  const [result, categories] = await Promise.all([
    listPosts(fetch, { category, search, page, limit: PER_PAGE }),
    listCategories(fetch),
  ]);

  return {
    posts: result.items,
    categories,
    activeCategory: category ?? null,
    search: search ?? "",
    page: result.page,
    totalPages: result.totalPages,
    total: result.total,
  };
};

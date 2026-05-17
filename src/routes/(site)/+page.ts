import { listPosts } from "$lib/data/provider";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
  const result = await listPosts(fetch, { limit: 7 });
  const [featured, ...rest] = result.items;
  return { featured: featured ?? null, posts: rest };
};

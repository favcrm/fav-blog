import { listPosts } from "$lib/data/provider";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch, parent }) => {
  const { companyId } = await parent();
  const result = await listPosts({ limit: 7 }, { fetch, companyId });
  const [featured, ...rest] = result.items;
  return { featured: featured ?? null, posts: rest };
};

import { error } from "@sveltejs/kit";
import { getPost, listRelatedPosts } from "$lib/data/provider";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch, parent }) => {
  const { companyId } = await parent();
  const ctx = { fetch, companyId };

  const post = await getPost(params.slug, ctx);
  if (!post) throw error(404, "Essay not found");
  const related = await listRelatedPosts(post, 3, ctx);
  return { post, related };
};

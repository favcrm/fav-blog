import { error } from "@sveltejs/kit";
import { getPost, listRelatedPosts } from "$lib/data/provider";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch }) => {
  const post = await getPost(fetch, params.slug);
  if (!post) throw error(404, "Essay not found");
  const related = await listRelatedPosts(fetch, post, 3);
  return { post, related };
};

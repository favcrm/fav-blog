import { error } from "@sveltejs/kit";
import { getPost } from "$lib/data/provider";
import { blocksToMarkdown } from "$lib/utils/markdown";
import type { RequestHandler } from "./$types";

/** Agent-friendly Markdown rendering of a single essay. */
export const GET: RequestHandler = async ({ params, fetch, url, locals }) => {
  const post = await getPost(params.slug, {
    fetch,
    companyId: locals.companyId,
  });
  if (!post) throw error(404, "Essay not found");

  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString()
    : new Date(post.createdAt).toLocaleDateString();

  const markdown = `# ${post.title}

*Published: ${date}*
*Original URL: ${url.origin}/blog/${post.slug}*

---

${blocksToMarkdown(post.blocks)}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};

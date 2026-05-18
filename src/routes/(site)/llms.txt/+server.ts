import { listPosts } from "$lib/data/provider";
import { fetchTenantConfig } from "$lib/tenant";
import type { RequestHandler } from "./$types";

/** llmstxt.org directory — an agent-friendly index of the publication. */
export const GET: RequestHandler = async ({ fetch, url, locals }) => {
  const base = url.origin;
  const ctx = { fetch, companyId: locals.companyId };
  const [tenant, result] = await Promise.all([
    fetchTenantConfig(ctx),
    listPosts({ limit: 30 }, ctx).catch(() => null),
  ]);
  const posts = result?.items ?? [];

  let content = `# ${tenant.brandName}

${tenant.brandDescription}

This is the agent-friendly directory for this publication. Each essay below has
a Markdown view at \`/blog/<slug>/llms.txt\`.

## Pages

- [Home](${base}/)
- [Essays](${base}/blog)
- [About](${base}/about)
- [Contact](${base}/contact)

## Essays
`;

  if (posts.length) {
    for (const post of posts) {
      content += `\n- [${post.title}](${base}/blog/${post.slug})\n`;
      if (post.excerpt) content += `  > ${post.excerpt}\n`;
      content += `  Markdown: ${base}/blog/${post.slug}/llms.txt\n`;
    }
  } else {
    content += `\n*No essays published yet.*\n`;
  }

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};

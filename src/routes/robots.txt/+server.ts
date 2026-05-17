import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
  const sitemapUrl = new URL("/sitemap.xml", url.origin).href;

  const content = `
User-agent: *
Allow: /

# Directories
Disallow: /admin/

# AI Agents are welcome to index the public content
User-agent: GPTBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: PerplexityBot
Allow: /

Sitemap: ${sitemapUrl}
`.trim();

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};

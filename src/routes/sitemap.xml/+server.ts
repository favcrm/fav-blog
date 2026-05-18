import { listPosts } from "$lib/data/provider";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ fetch, url, locals }) => {
  const base = url.origin;
  const result = await listPosts(
    { limit: 200 },
    { fetch, companyId: locals.companyId },
  ).catch(() => null);

  const urls: {
    loc: string;
    lastmod?: string;
    changefreq?: string;
    priority?: number;
  }[] = [
    { loc: "/", priority: 1.0, changefreq: "daily" },
    { loc: "/blog", priority: 0.9, changefreq: "daily" },
    { loc: "/about", priority: 0.5, changefreq: "monthly" },
    { loc: "/contact", priority: 0.4, changefreq: "monthly" },
  ];

  for (const post of result?.items ?? []) {
    urls.push({
      loc: `/blog/${post.slug}`,
      lastmod: post.updatedAt || post.createdAt,
      priority: 0.7,
      changefreq: "weekly",
    });
  }

  const xml =
    '<?xml version="1.0" encoding="UTF-8" ?>\n' +
    '<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls
      .map((u) => {
        let entry = `  <url>\n    <loc>${base}${u.loc}</loc>\n`;
        if (u.lastmod)
          entry += `    <lastmod>${new Date(u.lastmod).toISOString()}</lastmod>\n`;
        if (u.changefreq)
          entry += `    <changefreq>${u.changefreq}</changefreq>\n`;
        if (u.priority) entry += `    <priority>${u.priority}</priority>\n`;
        return entry + "  </url>";
      })
      .join("\n") +
    "\n</urlset>";

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};

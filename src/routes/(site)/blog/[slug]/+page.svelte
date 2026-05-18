<script lang="ts">
  import { ArrowLeft } from "lucide-svelte";
  import BlockContent from "$lib/components/site/BlockContent.svelte";
  import { getAuthor } from "$lib/data/mock/brand";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const post = $derived(data.post);

  const author = $derived(
    getAuthor((post.meta?.authorId as string) ?? post.authorId),
  );

  const publishedDate = $derived(
    post.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "",
  );

  const schemaOrg = $derived({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || undefined,
    image: post.featuredImage || undefined,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    author: author
      ? { "@type": "Person", name: author.name }
      : { "@type": "Organization", name: data.tenant.brandName },
  });

  const jsonLd = $derived(
    `<script type="application/ld+json">${JSON.stringify(schemaOrg)}</scr` +
      `ipt>`,
  );
</script>

<svelte:head>
  <title>{post.seoTitle || post.title} — {data.tenant.brandName}</title>
  {#if post.seoDescription || post.excerpt}
    <meta name="description" content={post.seoDescription || post.excerpt} />
  {/if}
  <link rel="alternate" type="text/markdown" href="/blog/{post.slug}/llms.txt" />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html jsonLd}
</svelte:head>

<article class="article">
  <header class="article-head site-container">
    <a class="back" href="/blog">
      <ArrowLeft size={15} strokeWidth={1.8} />
      All essays
    </a>
    <div class="article-meta">
      {#if post.categories?.length}
        <a class="article-cat" href={`/blog?category=${post.categories[0].slug}`}>
          {post.categories[0].name}
        </a>
        <span class="dot" aria-hidden="true">/</span>
      {/if}
      <span>{publishedDate}</span>
    </div>
    <h1>{post.title}</h1>
    {#if post.excerpt}
      <p class="article-standfirst">{post.excerpt}</p>
    {/if}
    {#if author}
      <div class="byline">
        <span class="byline-avatar">{author.name.charAt(0)}</span>
        <span>
          <strong>{author.name}</strong>
          <span class="byline-role">{author.role}</span>
        </span>
      </div>
    {/if}
  </header>

  {#if post.featuredImage}
    <div class="site-container article-hero">
      <img src={post.featuredImage} alt={post.title} />
    </div>
  {/if}

  <div class="article-body site-container">
    <BlockContent blocks={post.blocks} />
  </div>

  {#if post.tags?.length}
    <div class="site-container article-tags">
      {#each post.tags as tag (tag.id)}
        <span class="tag">#{tag.name}</span>
      {/each}
    </div>
  {/if}
</article>

{#if data.related.length}
  <aside class="related site-container">
    <h2>More from {data.tenant.brandName}</h2>
    <div class="related-list">
      {#each data.related as item (item.id)}
        <a class="related-item" href={`/blog/${item.slug}`}>
          <span class="related-cat">
            {item.categories[0]?.name ?? "Essay"}
          </span>
          <span class="related-title">{item.title}</span>
        </a>
      {/each}
    </div>
  </aside>
{/if}

<style>
  .article-head {
    max-width: 760px;
    padding-top: clamp(32px, 5vw, 64px);
  }
  .back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.82rem;
    color: var(--muted);
    margin-bottom: clamp(24px, 4vw, 40px);
  }
  .back:hover {
    color: var(--accent);
  }
  .article-meta {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 0.74rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .article-cat {
    color: var(--accent);
    font-weight: 600;
  }
  .dot {
    color: var(--line);
  }
  .article-head h1 {
    margin: 0.7rem 0 0;
    font-family: var(--font-display);
    font-weight: 800;
    font-size: clamp(2.2rem, 6vw, 4rem);
    line-height: 0.98;
    letter-spacing: -0.035em;
    text-transform: uppercase;
    color: var(--ink);
  }
  .article-standfirst {
    margin: 1.2rem 0 0;
    font-family: var(--font-sans);
    font-weight: 500;
    font-size: clamp(1.1rem, 2.2vw, 1.4rem);
    line-height: 1.45;
    color: var(--ink-soft);
  }
  .byline {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: clamp(22px, 3vw, 34px);
    padding-top: 20px;
    border-top: 1px solid var(--line);
  }
  .byline-avatar {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: var(--ink);
    color: var(--accent-ink);
    font-family: var(--font-display);
    font-size: 1rem;
  }
  .byline strong {
    display: block;
    font-size: 0.9rem;
    color: var(--ink);
  }
  .byline-role {
    font-size: 0.78rem;
    color: var(--muted);
  }
  .article-hero {
    max-width: 960px;
    margin-top: clamp(32px, 5vw, 56px);
  }
  .article-hero img {
    width: 100%;
    max-height: 62vh;
    object-fit: cover;
    border-radius: var(--radius-card);
  }
  .article-body {
    max-width: 680px;
    margin-top: clamp(32px, 5vw, 56px);
  }
  .article-tags {
    max-width: 680px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid var(--line);
  }
  .tag {
    font-size: 0.8rem;
    color: var(--muted);
  }
  .related {
    max-width: 960px;
    margin-top: clamp(40px, 6vw, 72px);
  }
  .related h2 {
    margin: 0 0 8px;
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1.5rem;
    letter-spacing: -0.02em;
    text-transform: uppercase;
    color: var(--ink);
  }
  .related-list {
    display: grid;
    gap: 0;
  }
  .related-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 20px 0;
    border-top: 1px solid var(--line);
  }
  .related-cat {
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--accent);
    font-weight: 600;
  }
  .related-title {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.3rem;
    letter-spacing: -0.02em;
    text-transform: uppercase;
    color: var(--ink);
  }
  .related-item:hover .related-title {
    color: var(--accent);
  }
</style>

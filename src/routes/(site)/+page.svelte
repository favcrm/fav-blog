<script lang="ts">
  import BlogCard from "$lib/components/site/BlogCard.svelte";
  import EmptyState from "$lib/components/site/EmptyState.svelte";
  import { Feather } from "lucide-svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  function featuredDate(iso: string | null): string {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
</script>

<svelte:head>
  <title>{data.tenant.brandName} — {data.tenant.brandTagline}</title>
</svelte:head>

<!-- Masthead hero -->
<section class="home-hero site-container">
  <div class="hero-rule">
    <span>The journal</span>
    <span>{today}</span>
  </div>
  <h1 class="hero-title">{data.tenant.brandName}</h1>
  <p class="hero-tagline">{data.tenant.brandTagline}</p>
  <p class="hero-desc">{data.tenant.brandDescription}</p>
</section>

{#if !data.tenant.isLive}
  <div class="site-container">
    <a class="demo-banner" href="/setup">
      <Feather size={16} strokeWidth={1.6} />
      <span>
        <strong>Demo mode.</strong> You are reading built-in sample essays. Connect
        a free FavCRM workspace to publish your own →
      </span>
    </a>
  </div>
{/if}

<!-- Featured essay -->
{#if data.featured}
  {@const post = data.featured}
  <section class="featured site-container">
    <div class="featured-label">Featured essay</div>
    <a class="featured-card" href={`/blog/${post.slug}`}>
      <div class="featured-meta">
        {#if post.categories?.length}
          <span class="featured-cat">{post.categories[0].name}</span>
        {/if}
        <span>{featuredDate(post.publishedAt)}</span>
      </div>
      <h2 class="featured-title">{post.title}</h2>
      {#if post.excerpt}
        <p class="featured-excerpt">{post.excerpt}</p>
      {/if}
      <span class="featured-more">Read the essay →</span>
    </a>
  </section>
{/if}

<!-- Recent essays -->
<section class="recent site-container">
  <div class="recent-head">
    <h2>Recent essays</h2>
    <a href="/blog">All essays →</a>
  </div>
  {#if data.posts.length}
    <div class="recent-list">
      {#each data.posts as post, i (post.id)}
        <BlogCard {post} index={i} />
      {/each}
    </div>
  {:else if !data.featured}
    <EmptyState
      icon={Feather}
      title="No essays yet"
      description="Publish your first post in FavCRM, or explore the demo content."
    />
  {/if}
</section>

<style>
  .home-hero {
    padding-top: clamp(48px, 8vw, 104px);
    padding-bottom: clamp(28px, 4vw, 48px);
  }
  .hero-rule {
    display: flex;
    justify-content: space-between;
    padding-bottom: 14px;
    border-bottom: 1.5px solid var(--ink);
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .hero-title {
    margin: clamp(24px, 4vw, 44px) 0 0;
    font-family: var(--font-display);
    font-weight: 400;
    font-size: clamp(3.5rem, 13vw, 9rem);
    line-height: 0.92;
    letter-spacing: -0.04em;
    color: var(--ink);
  }
  .hero-tagline {
    margin: clamp(18px, 3vw, 30px) 0 0;
    max-width: 30ch;
    font-family: var(--font-display);
    font-style: italic;
    font-weight: 400;
    font-size: clamp(1.35rem, 3vw, 2rem);
    line-height: 1.25;
    color: var(--accent);
  }
  .hero-desc {
    margin: 1rem 0 0;
    max-width: 52ch;
    color: var(--ink-soft);
    font-size: 1.02rem;
    line-height: 1.6;
  }
  .demo-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 8px 0 24px;
    padding: 14px 18px;
    background: var(--accent-soft);
    border: 1px solid var(--line);
    border-radius: var(--radius-card);
    color: var(--ink-soft);
    font-size: 0.9rem;
  }
  .demo-banner strong {
    color: var(--ink);
  }
  .demo-banner :global(svg) {
    flex-shrink: 0;
    color: var(--accent);
  }
  .featured {
    padding: clamp(24px, 4vw, 44px) 0;
  }
  .featured-label {
    margin-bottom: 16px;
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .featured-card {
    display: block;
    padding: clamp(28px, 4vw, 52px);
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--radius-card);
    color: inherit;
    transition: border-color 200ms ease;
  }
  .featured-card:hover {
    border-color: var(--ink);
  }
  .featured-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.74rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .featured-cat {
    color: var(--accent);
    font-weight: 600;
  }
  .featured-title {
    margin: 0.6rem 0 0;
    font-family: var(--font-display);
    font-weight: 400;
    font-size: clamp(2rem, 5.2vw, 3.6rem);
    line-height: 1.05;
    letter-spacing: -0.03em;
    color: var(--ink);
  }
  .featured-excerpt {
    margin: 1rem 0 0;
    max-width: 56ch;
    font-size: 1.1rem;
    line-height: 1.6;
    color: var(--ink-soft);
  }
  .featured-more {
    display: inline-block;
    margin-top: 1.4rem;
    font-size: 0.82rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--accent);
  }
  .recent {
    padding: clamp(24px, 4vw, 48px) 0 clamp(20px, 3vw, 40px);
  }
  .recent-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
  }
  .recent-head h2 {
    margin: 0;
    font-family: var(--font-display);
    font-weight: 400;
    font-size: clamp(1.5rem, 3vw, 2.1rem);
    letter-spacing: -0.02em;
    color: var(--ink);
  }
  .recent-head a {
    font-size: 0.82rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--accent);
    white-space: nowrap;
  }
  .recent-list {
    margin-top: clamp(8px, 2vw, 20px);
    border-bottom: 1px solid var(--line);
  }
</style>

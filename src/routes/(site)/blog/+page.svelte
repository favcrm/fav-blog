<script lang="ts">
  import { Feather } from "lucide-svelte";
  import BlogCard from "$lib/components/site/BlogCard.svelte";
  import EmptyState from "$lib/components/site/EmptyState.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  function categoryHref(slug: string | null): string {
    return slug ? `/blog?category=${slug}` : "/blog";
  }

  function pageHref(n: number): string {
    const params = new URLSearchParams();
    if (data.activeCategory) params.set("category", data.activeCategory);
    if (data.search) params.set("q", data.search);
    if (n > 1) params.set("page", String(n));
    const qs = params.toString();
    return qs ? `/blog?${qs}` : "/blog";
  }
</script>

<svelte:head>
  <title>Essays — {data.tenant.brandName}</title>
  <meta name="description" content="Every essay from {data.tenant.brandName}." />
</svelte:head>

<header class="archive-head site-container">
  <div class="archive-rule">
    <span>The archive</span>
    <span>{data.total} {data.total === 1 ? "essay" : "essays"}</span>
  </div>
  <h1>Essays</h1>
  <nav class="filters" aria-label="Categories">
    <a class="filter" class:active={!data.activeCategory} href={categoryHref(null)}>
      All
    </a>
    {#each data.categories as cat (cat.id)}
      <a
        class="filter"
        class:active={data.activeCategory === cat.slug}
        href={categoryHref(cat.slug)}
      >
        {cat.name}
      </a>
    {/each}
  </nav>
</header>

<section class="site-container archive-body">
  {#if data.posts.length}
    <div class="archive-list">
      {#each data.posts as post, i (post.id)}
        <BlogCard {post} index={(data.page - 1) * 10 + i} />
      {/each}
    </div>

    {#if data.totalPages > 1}
      <nav class="pager" aria-label="Pagination">
        {#if data.page > 1}
          <a href={pageHref(data.page - 1)}>← Newer</a>
        {:else}
          <span class="pager-off">← Newer</span>
        {/if}
        <span class="pager-count">Page {data.page} of {data.totalPages}</span>
        {#if data.page < data.totalPages}
          <a href={pageHref(data.page + 1)}>Older →</a>
        {:else}
          <span class="pager-off">Older →</span>
        {/if}
      </nav>
    {/if}
  {:else}
    <EmptyState
      icon={Feather}
      title="Nothing here yet"
      description="No essays match this filter. Try another category."
    />
  {/if}
</section>

<style>
  .archive-head {
    padding-top: clamp(40px, 6vw, 80px);
  }
  .archive-rule {
    display: flex;
    justify-content: space-between;
    padding-bottom: 14px;
    border-bottom: 1.5px solid var(--ink);
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .archive-head h1 {
    margin: clamp(20px, 3vw, 36px) 0 0;
    font-family: var(--font-display);
    font-weight: 400;
    font-size: clamp(2.6rem, 8vw, 5rem);
    letter-spacing: -0.035em;
    line-height: 1;
    color: var(--ink);
  }
  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: clamp(20px, 3vw, 32px);
  }
  .filter {
    padding: 6px 14px;
    font-size: 0.82rem;
    color: var(--ink-soft);
    border: 1px solid var(--line);
    border-radius: var(--radius-pill);
    transition:
      color 160ms ease,
      border-color 160ms ease,
      background 160ms ease;
  }
  .filter:hover {
    border-color: var(--ink);
  }
  .filter.active {
    color: var(--accent-ink);
    background: var(--ink);
    border-color: var(--ink);
  }
  .archive-body {
    padding-top: clamp(8px, 2vw, 24px);
  }
  .archive-list {
    border-bottom: 1px solid var(--line);
  }
  .pager {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 28px;
    font-size: 0.85rem;
  }
  .pager a {
    color: var(--accent);
  }
  .pager-off {
    color: var(--line);
  }
  .pager-count {
    color: var(--muted);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-size: 0.74rem;
  }
</style>

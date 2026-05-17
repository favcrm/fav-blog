<script lang="ts">
  import type { BlogPostListItem } from "@favcrm/sdk";

  let { post, index }: { post: BlogPostListItem; index?: number } = $props();

  const href = $derived(`/blog/${post.slug}`);
  const date = $derived(
    post.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "",
  );
  const ordinal = $derived(
    index !== undefined ? String(index + 1).padStart(2, "0") : null,
  );
</script>

<a class="entry" {href}>
  <div class="entry-rail">
    {#if ordinal}<span class="entry-no">{ordinal}</span>{/if}
    {#if post.featuredImage}
      <span class="entry-thumb">
        <img src={post.featuredImage} alt="" loading="lazy" />
      </span>
    {/if}
  </div>
  <div class="entry-body">
    <div class="entry-meta">
      {#if post.categories?.length}
        <span class="entry-cat">{post.categories[0].name}</span>
        <span class="entry-sep" aria-hidden="true">/</span>
      {/if}
      <span>{date}</span>
    </div>
    <h3 class="entry-title">{post.title}</h3>
    {#if post.excerpt}
      <p class="entry-excerpt">{post.excerpt}</p>
    {/if}
    <span class="entry-more">Read essay →</span>
  </div>
</a>

<style>
  .entry {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: clamp(16px, 3vw, 36px);
    padding: clamp(22px, 3vw, 32px) 0;
    border-top: 1px solid var(--line);
    color: inherit;
  }
  .entry-rail {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .entry-no {
    font-family: var(--font-display);
    font-size: 0.95rem;
    font-style: italic;
    color: var(--accent);
  }
  .entry-thumb {
    display: block;
    width: clamp(56px, 9vw, 92px);
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: var(--radius-card);
    background: var(--accent-soft);
  }
  .entry-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .entry-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.74rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .entry-cat {
    color: var(--accent);
    font-weight: 600;
  }
  .entry-sep {
    color: var(--line);
  }
  .entry-title {
    margin: 0.5rem 0 0;
    font-family: var(--font-display);
    font-weight: 400;
    font-size: clamp(1.4rem, 2.6vw, 2rem);
    line-height: 1.15;
    letter-spacing: -0.018em;
    color: var(--ink);
    transition: color 160ms ease;
  }
  .entry:hover .entry-title {
    color: var(--accent);
  }
  .entry-excerpt {
    margin: 0.55rem 0 0;
    max-width: 56ch;
    color: var(--ink-soft);
    font-size: 0.98rem;
    line-height: 1.6;
  }
  .entry-more {
    display: inline-block;
    margin-top: 0.9rem;
    font-size: 0.78rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ink);
  }
  .entry:hover .entry-more {
    color: var(--accent);
  }
</style>

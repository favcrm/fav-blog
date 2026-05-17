<script lang="ts">
  /**
   * Renders a FavCRM content-block array (the JSON string stored on
   * `BlogPost.blocks`) as article HTML. Unknown block types are skipped, per
   * the SDK forward-compatibility contract.
   */
  import type { AnyBlock } from "@favcrm/sdk";

  let { blocks }: { blocks: string | null } = $props();

  function parse(raw: string | null): AnyBlock[] {
    if (!raw) return [];
    try {
      const value = JSON.parse(raw);
      return Array.isArray(value) ? (value as AnyBlock[]) : [];
    } catch {
      return [];
    }
  }

  const parsed = $derived(parse(blocks));

  function anchorId(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
</script>

<div class="prose">
  {#each parsed as block (block.id)}
    {@const data = block.data as Record<string, unknown>}
    {#if block.type === "paragraph"}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      <p>{@html String(data.html ?? "")}</p>
    {:else if block.type === "heading"}
      {@const level = Number(data.level ?? 2)}
      {@const text = String(data.text ?? "")}
      {#if level === 2}
        <h2 id={anchorId(text)}>{text}</h2>
      {:else if level === 3}
        <h3 id={anchorId(text)}>{text}</h3>
      {:else}
        <h4 id={anchorId(text)}>{text}</h4>
      {/if}
    {:else if block.type === "list"}
      {#if data.ordered}
        <ol>
          {#each (data.items as string[]) ?? [] as item, i (i)}
            <li>{item}</li>
          {/each}
        </ol>
      {:else}
        <ul>
          {#each (data.items as string[]) ?? [] as item, i (i)}
            <li>{item}</li>
          {/each}
        </ul>
      {/if}
    {:else if block.type === "quote"}
      <blockquote>
        <p>{data.text}</p>
        {#if data.cite}<cite>— {data.cite}</cite>{/if}
      </blockquote>
    {:else if block.type === "callout"}
      <aside class="callout callout--{data.tone ?? 'note'}">
        {#if data.title}<strong>{data.title}</strong>{/if}
        <p>{data.body}</p>
      </aside>
    {:else if block.type === "code"}
      <pre><code>{data.code}</code></pre>
    {:else if block.type === "divider"}
      <hr />
    {:else if block.type === "image"}
      <figure>
        <img src={String(data.url)} alt={String(data.alt ?? "")} loading="lazy" />
        {#if data.caption}<figcaption>{data.caption}</figcaption>{/if}
      </figure>
    {:else if block.type === "youtube"}
      <div class="embed">
        <iframe
          src={`https://www.youtube.com/embed/${data.videoId}`}
          title={String(data.title ?? "Video")}
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    {:else if block.type === "embed"}
      <div class="embed">
        <iframe src={String(data.url)} title="Embedded content" allowfullscreen></iframe>
      </div>
    {:else if block.type === "html"}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html String(data.html ?? "")}
    {:else if block.type === "cta"}
      <p class="cta">
        <a href={String(data.href)} class="cta__link">{data.label}</a>
      </p>
    {/if}
  {/each}
</div>

<style>
  .prose {
    font-size: 1.075rem;
    line-height: 1.75;
    color: var(--ink-soft);
  }
  .prose :global(p),
  .prose :global(ul),
  .prose :global(ol),
  .prose :global(figure) {
    margin: 0 0 1.4em;
  }
  .prose :global(h2),
  .prose :global(h3),
  .prose :global(h4) {
    font-family: var(--font-display);
    color: var(--ink);
    line-height: 1.2;
    margin: 2.2em 0 0.6em;
    letter-spacing: -0.01em;
  }
  .prose :global(h2) {
    font-size: 1.7rem;
  }
  .prose :global(h3) {
    font-size: 1.35rem;
  }
  .prose :global(a) {
    color: var(--ink);
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 1px;
    text-decoration-color: var(--accent);
  }
  .prose :global(ul),
  .prose :global(ol) {
    padding-left: 1.25rem;
  }
  .prose :global(li) {
    margin: 0.35em 0;
  }
  .prose :global(blockquote) {
    margin: 1.8em 0;
    padding: 0.2em 0 0.2em 1.4rem;
    border-left: 3px solid var(--accent);
    font-family: var(--font-display);
    font-size: 1.3rem;
    font-style: italic;
    color: var(--ink);
  }
  .prose :global(blockquote cite) {
    display: block;
    margin-top: 0.5em;
    font-size: 0.85rem;
    font-style: normal;
    font-family: var(--font-sans);
    color: var(--muted);
  }
  .callout {
    margin: 1.8em 0;
    padding: 1.1rem 1.25rem;
    border: 1px solid var(--line);
    border-left: 3px solid var(--accent);
    background: var(--accent-soft);
    border-radius: 0 var(--radius-card) var(--radius-card) 0;
  }
  .callout strong {
    display: block;
    margin-bottom: 0.3em;
    font-family: var(--font-sans);
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--ink);
  }
  .callout :global(p) {
    margin: 0;
    font-size: 0.98rem;
  }
  .callout--warning {
    border-left-color: #b45309;
    background: #fff7ed;
  }
  .callout--success {
    border-left-color: #15803d;
    background: #f0fdf4;
  }
  .callout--danger {
    border-left-color: #b91c1c;
    background: #fef2f2;
  }
  .prose :global(pre) {
    margin: 1.6em 0;
    padding: 1.1rem;
    overflow-x: auto;
    background: var(--ink);
    color: #f4f4f4;
    border-radius: var(--radius-card);
    font-size: 0.9rem;
  }
  .prose :global(hr) {
    margin: 2.4em 0;
    border: none;
    border-top: 1px solid var(--line);
  }
  .prose :global(figure img) {
    width: 100%;
    border-radius: var(--radius-card);
  }
  .prose :global(figcaption) {
    margin-top: 0.5em;
    font-size: 0.85rem;
    color: var(--muted);
  }
  .embed {
    position: relative;
    margin: 1.8em 0;
    aspect-ratio: 16 / 9;
  }
  .embed :global(iframe) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
    border-radius: var(--radius-card);
  }
  .cta {
    text-align: center;
  }
  .cta__link {
    display: inline-block;
    padding: 0.7rem 1.5rem;
    background: var(--ink) !important;
    color: var(--paper) !important;
    text-decoration: none !important;
    border-radius: var(--radius-pill);
    font-family: var(--font-sans);
    font-size: 0.9rem;
  }
</style>

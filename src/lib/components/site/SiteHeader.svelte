<script lang="ts">
  import { page } from "$app/stores";

  let {
    brandName = "Offhours",
    brandLogoUrl = null,
    isLive = false,
  }: {
    brandName?: string;
    brandLogoUrl?: string | null;
    /** Live mode = connected to a workspace. Hides the demo "Start a blog" CTA. */
    isLive?: boolean;
  } = $props();

  let menuOpen = $state(false);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/blog", label: "Essays" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  function isActive(href: string, pathname: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  $effect(() => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = menuOpen ? "hidden" : "";
    }
  });
</script>

<header class="masthead">
  <div class="site-container masthead-inner">
    <a class="wordmark" href="/" onclick={() => (menuOpen = false)}>
      {#if brandLogoUrl}
        <img src={brandLogoUrl} alt={brandName} />
      {:else}
        <span class="wordmark-text">{brandName}</span>
      {/if}
    </a>

    <nav class="masthead-nav" aria-label="Primary">
      {#each navItems as item (item.href)}
        <a
          href={item.href}
          class="masthead-link"
          class:active={isActive(item.href, $page.url.pathname)}
        >
          {item.label}
        </a>
      {/each}
      {#if !isLive}
        <a class="masthead-cta" href="/setup">Start a blog</a>
      {/if}
    </nav>

    <button
      class="masthead-toggle"
      type="button"
      aria-label="Toggle menu"
      aria-expanded={menuOpen}
      onclick={() => (menuOpen = !menuOpen)}
    >
      <span class="bar" class:open={menuOpen}></span>
      <span class="bar" class:open={menuOpen}></span>
    </button>
  </div>
</header>

{#if menuOpen}
  <div class="mobile-sheet">
    <nav class="mobile-nav">
      {#each navItems as item (item.href)}
        <a
          href={item.href}
          class="mobile-link"
          class:active={isActive(item.href, $page.url.pathname)}
          onclick={() => (menuOpen = false)}
        >
          {item.label}
        </a>
      {/each}
    </nav>
    {#if !isLive}
      <a class="mobile-cta" href="/setup" onclick={() => (menuOpen = false)}>
        Start your own blog →
      </a>
    {/if}
  </div>
{/if}

<style>
  .masthead {
    position: sticky;
    top: 0;
    z-index: 50;
    background: color-mix(in srgb, var(--paper) 92%, transparent);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--line);
  }
  .masthead-inner {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 24px;
    height: 70px;
  }
  .wordmark {
    align-self: center;
  }
  .wordmark img {
    height: 26px;
    width: auto;
  }
  .wordmark-text {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
    text-transform: uppercase;
    color: var(--ink);
  }
  .masthead-nav {
    display: none;
    align-items: center;
    gap: 4px;
    align-self: center;
  }
  .masthead-link {
    padding: 6px 12px;
    font-size: 0.86rem;
    color: var(--ink-soft);
    transition: color 160ms ease;
  }
  .masthead-link:hover {
    color: var(--ink);
  }
  .masthead-link.active {
    color: var(--accent);
  }
  .masthead-cta {
    margin-left: 10px;
    padding: 7px 16px;
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--accent-ink);
    background: var(--ink);
    border-radius: var(--radius-pill);
    transition: background 160ms ease;
  }
  .masthead-cta:hover {
    background: var(--accent);
  }
  .masthead-toggle {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    width: 36px;
    height: 36px;
    align-self: center;
    border: 0;
    background: transparent;
    cursor: pointer;
  }
  .bar {
    height: 1.5px;
    width: 20px;
    background: var(--ink);
    transition: transform 240ms ease;
  }
  .bar.open:nth-child(1) {
    transform: translateY(3.25px) rotate(45deg);
  }
  .bar.open:nth-child(2) {
    transform: translateY(-3.25px) rotate(-45deg);
  }
  .mobile-sheet {
    position: fixed;
    inset: 70px 0 0;
    z-index: 49;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 40px clamp(20px, 6vw, 48px) 56px;
    background: var(--paper);
  }
  .mobile-nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .mobile-link {
    font-family: var(--font-display);
    font-size: 2.4rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    text-transform: uppercase;
    color: var(--ink-soft);
    padding: 6px 0;
  }
  .mobile-link.active {
    color: var(--accent);
  }
  .mobile-cta {
    align-self: flex-start;
    padding: 12px 22px;
    font-size: 0.95rem;
    color: var(--accent-ink);
    background: var(--ink);
    border-radius: var(--radius-pill);
  }
  @media (min-width: 820px) {
    .masthead-nav {
      display: flex;
    }
    .masthead-toggle {
      display: none;
    }
  }
</style>

<script lang="ts">
  let {
    brandName = "Offhours",
    tagline = "A field journal for people who make things.",
  }: { brandName?: string; tagline?: string } = $props();

  const year = new Date().getFullYear();

  const sections = [
    {
      title: "Read",
      links: [
        { href: "/blog", label: "All essays" },
        { href: "/blog?category=craft", label: "Craft" },
        { href: "/blog?category=process", label: "Process" },
        { href: "/blog?category=field-notes", label: "Field notes" },
      ],
    },
    {
      title: "Publication",
      links: [
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
        { href: "/privacy", label: "Privacy" },
        { href: "/terms", label: "Terms" },
      ],
    },
    {
      title: "Run this blog",
      links: [
        { href: "/setup", label: "Set up" },
        { href: "/admin", label: "Admin" },
        { href: "/llms.txt", label: "llms.txt" },
      ],
    },
  ];
</script>

<footer class="footer">
  <div class="site-container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a class="footer-wordmark" href="/">{brandName}</a>
        <p class="footer-tag">{tagline}</p>
      </div>
      {#each sections as section (section.title)}
        <nav class="footer-col">
          <h3>{section.title}</h3>
          {#each section.links as link (link.href)}
            <a href={link.href}>{link.label}</a>
          {/each}
        </nav>
      {/each}
    </div>
    <div class="footer-base">
      <span>&copy; {year} {brandName}</span>
      <span class="footer-built">
        Published with
        <a href="https://favcrm.io" target="_blank" rel="noopener noreferrer">
          FavCRM
        </a>
      </span>
    </div>
  </div>
</footer>

<style>
  .footer {
    margin-top: clamp(48px, 8vw, 96px);
    padding: clamp(48px, 7vw, 88px) 0 36px;
    border-top: 1px solid var(--line);
    background: var(--surface);
  }
  .footer-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: clamp(32px, 5vw, 56px);
  }
  .footer-brand {
    max-width: 280px;
  }
  .footer-wordmark {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    text-transform: uppercase;
    color: var(--ink);
  }
  .footer-tag {
    margin: 10px 0 0;
    color: var(--muted);
    font-size: 0.92rem;
    line-height: 1.55;
  }
  .footer-col {
    display: flex;
    flex-direction: column;
    gap: 9px;
  }
  .footer-col h3 {
    margin: 0 0 4px;
    font-family: var(--font-sans);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .footer-col a {
    font-size: 0.9rem;
    color: var(--ink-soft);
    transition: color 160ms ease;
  }
  .footer-col a:hover {
    color: var(--accent);
  }
  .footer-base {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 12px;
    margin-top: clamp(36px, 5vw, 56px);
    padding-top: 24px;
    border-top: 1px solid var(--line);
    font-size: 0.82rem;
    color: var(--muted);
  }
  .footer-built a {
    color: var(--ink);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  @media (min-width: 720px) {
    .footer-grid {
      grid-template-columns: 1.4fr 1fr 1fr 1fr;
    }
  }
</style>

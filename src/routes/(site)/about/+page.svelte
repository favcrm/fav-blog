<script lang="ts">
  import { authors } from "$lib/data/mock/brand";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>About — {data.tenant.brandName}</title>
  <meta name="description" content={data.tenant.brandDescription} />
</svelte:head>

<section class="site-container about">
  <div class="about-rule">About the publication</div>
  <h1>{data.tenant.brandName}</h1>
  <p class="about-lead">{data.tenant.brandTagline}</p>

  <div class="about-body">
    <p>{data.tenant.brandDescription}</p>
    <p>
      This site is a publication template for <a
        href="https://favcrm.io"
        target="_blank"
        rel="noopener noreferrer">FavCRM</a
      > — a headless content backend. Essays, categories, and SEO metadata are
      managed from the FavCRM CMS and rendered here through the typed content-block
      system. To run your own version, see <a href="/setup">Setup</a>.
    </p>
  </div>

  <div class="masthead-block">
    <h2>Masthead</h2>
    <div class="masthead-people">
      {#each authors as person (person.id)}
        <div class="person">
          <span class="person-avatar">{person.name.charAt(0)}</span>
          <div>
            <strong>{person.name}</strong>
            <span class="person-role">{person.role}</span>
            <p>{person.bio}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .about {
    max-width: 760px;
    padding-top: clamp(40px, 6vw, 80px);
  }
  .about-rule {
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .about h1 {
    margin: 14px 0 0;
    font-family: var(--font-display);
    font-weight: 800;
    font-size: clamp(2.6rem, 7vw, 4.4rem);
    line-height: 0.92;
    letter-spacing: -0.04em;
    text-transform: uppercase;
    color: var(--ink);
  }
  .about-lead {
    margin: 1rem 0 0;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: clamp(1.2rem, 2.6vw, 1.6rem);
    text-transform: uppercase;
    letter-spacing: -0.01em;
    color: var(--accent);
  }
  .about-body {
    margin-top: clamp(28px, 4vw, 44px);
    font-size: 1.08rem;
    line-height: 1.7;
    color: var(--ink-soft);
  }
  .about-body p {
    margin: 0 0 1.2em;
  }
  .about-body a {
    color: var(--ink);
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-color: var(--accent);
  }
  .masthead-block {
    margin-top: clamp(36px, 5vw, 60px);
    padding-top: clamp(28px, 4vw, 40px);
    border-top: 1px solid var(--line);
  }
  .masthead-block h2 {
    margin: 0 0 20px;
    font-family: var(--font-sans);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .masthead-people {
    display: grid;
    gap: 24px;
  }
  .person {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 16px;
  }
  .person-avatar {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--ink);
    color: var(--accent-ink);
    font-family: var(--font-display);
  }
  .person strong {
    color: var(--ink);
    font-size: 1.05rem;
  }
  .person-role {
    margin-left: 8px;
    font-size: 0.8rem;
    color: var(--accent);
  }
  .person p {
    margin: 4px 0 0;
    color: var(--muted);
    font-size: 0.94rem;
    line-height: 1.55;
  }
</style>

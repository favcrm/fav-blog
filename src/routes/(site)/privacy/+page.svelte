<script lang="ts">
  import type { PageData } from "./$types";
  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Privacy — {data.tenant.brandName}</title>
</svelte:head>

<section class="site-container legal">
  <div class="legal-rule">Privacy policy</div>
  <h1>Privacy</h1>
  <div class="legal-body">
    <p>
      This is a template privacy policy for {data.tenant.brandName}. Replace it
      with your own before publishing — it is a starting point, not legal advice.
    </p>
    <h2>What we collect</h2>
    <p>
      When you send a message through the contact form, we receive the name,
      email address, and message you provide. We use this only to reply to you.
    </p>
    <h2>Analytics</h2>
    <p>
      This site may record anonymous, aggregated page-view statistics. It does
      not sell personal data.
    </p>
    <h2>Contact</h2>
    <p>
      Questions about this policy can be sent to
      <a href={`mailto:${data.tenant.brandEmail}`}>{data.tenant.brandEmail}</a>.
    </p>
  </div>
</section>

<style>
  .legal {
    max-width: 680px;
    padding-top: clamp(40px, 6vw, 80px);
  }
  .legal-rule {
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .legal h1 {
    margin: 14px 0 0;
    font-family: var(--font-display);
    font-weight: 400;
    font-size: clamp(2.4rem, 6vw, 3.6rem);
    letter-spacing: -0.03em;
    color: var(--ink);
  }
  .legal-body {
    margin-top: clamp(24px, 4vw, 40px);
    font-size: 1.02rem;
    line-height: 1.7;
    color: var(--ink-soft);
  }
  .legal-body h2 {
    margin: 1.8em 0 0.4em;
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 1.3rem;
    color: var(--ink);
  }
  .legal-body p {
    margin: 0 0 1em;
  }
  .legal-body a {
    color: var(--accent);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
</style>

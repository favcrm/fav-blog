<script lang="ts">
  import { Check, Mail } from "lucide-svelte";
  import { isLiveMode } from "$lib/config";
  import { createFavCRM } from "$lib/favcrm";
  import Field from "$lib/components/site/Field.svelte";
  import Button from "$lib/components/site/Button.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  let name = $state("");
  let email = $state("");
  let message = $state("");
  let status = $state("");
  let success = $state(false);
  let loading = $state(false);

  const brandEmail = $derived(data.tenant.brandEmail);

  async function submit() {
    if (!name.trim() || !email.trim() || !message.trim()) {
      status = "Please fill in your name, email, and message.";
      success = false;
      return;
    }
    loading = true;
    status = "";
    try {
      if (isLiveMode()) {
        await createFavCRM().contact.submit({ name, email, message });
      } else {
        // Demo mode — no workspace to send to; simulate the success state.
        await new Promise((r) => setTimeout(r, 500));
      }
      status = isLiveMode()
        ? "Thank you. Your message has been sent."
        : "Demo mode — connect a workspace to receive real messages.";
      success = true;
      name = email = message = "";
    } catch (err) {
      status = err instanceof Error ? err.message : "Unable to send message.";
      success = false;
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Contact — {data.tenant.brandName}</title>
</svelte:head>

<section class="site-container contact">
  <div class="contact-intro">
    <div class="contact-rule">Correspondence</div>
    <h1>Write to us</h1>
    <p class="contact-lead">
      Story tips, corrections, or a note about something you read — every
      message reaches the editor.
    </p>
    {#if brandEmail}
      <a class="contact-email" href={`mailto:${brandEmail}`}>
        <Mail size={16} strokeWidth={1.6} />
        {brandEmail}
      </a>
    {/if}
  </div>

  <form class="cf-form" onsubmit={(e) => e.preventDefault()}>
    <Field label="Your name" name="name" bind:value={name} required />
    <Field
      label="Email"
      name="email"
      type="email"
      autocomplete="email"
      bind:value={email}
      required
    />
    <Field
      label="Message"
      name="message"
      type="textarea"
      rows={6}
      bind:value={message}
      required
    />
    {#if status}
      <p class={`notice ${success ? "notice--success" : "notice--error"}`}>
        {#if success}<Check size={16} strokeWidth={2} />{/if}
        {status}
      </p>
    {/if}
    <Button onclick={submit} disabled={loading} size="lg">
      {loading ? "Sending…" : "Send message"}
    </Button>
  </form>
</section>

<style>
  .contact {
    display: grid;
    grid-template-columns: 1fr;
    gap: clamp(32px, 5vw, 64px);
    padding-top: clamp(40px, 6vw, 80px);
  }
  .contact-rule {
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .contact-intro h1 {
    margin: 14px 0 0;
    font-family: var(--font-display);
    font-weight: 400;
    font-size: clamp(2.4rem, 6vw, 4rem);
    line-height: 1;
    letter-spacing: -0.035em;
    color: var(--ink);
  }
  .contact-lead {
    margin: 1rem 0 0;
    max-width: 38ch;
    color: var(--ink-soft);
    font-size: 1.02rem;
    line-height: 1.6;
  }
  .contact-email {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 1.4rem;
    font-size: 0.92rem;
    color: var(--accent);
  }
  .cf-form {
    display: grid;
    gap: 16px;
    padding: clamp(24px, 3.5vw, 36px);
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--radius-card);
  }
  @media (min-width: 820px) {
    .contact {
      grid-template-columns: 0.9fr 1.1fr;
    }
  }
</style>

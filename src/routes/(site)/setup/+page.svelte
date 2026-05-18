<script lang="ts">
  import { Check, Copy, Mail, KeyRound } from "lucide-svelte";
  import type { PageData } from "./$types";
  import type { ActionData } from "./$types";

  let { data, form }: { data: PageData; form: ActionData } = $props();

  const step = $derived(form?.step ?? "email");
  let copied = $state(false);

  async function copyId(id: string) {
    try {
      await navigator.clipboard.writeText(id);
      copied = true;
      setTimeout(() => (copied = false), 1800);
    } catch {
      copied = false;
    }
  }
</script>

<svelte:head>
  <title>Set up your blog — {data.tenant.brandName}</title>
  <meta
    name="description"
    content="Register a free FavCRM workspace and connect it to this blog template."
  />
</svelte:head>

<section class="site-container setup">
  <div class="setup-intro">
    <div class="setup-rule">Template setup</div>
    <h1>Run your own blog</h1>
    <p>
      This template ships in <strong>demo mode</strong> with sample essays. To
      publish your own writing, register a free FavCRM workspace below — it
      becomes the CMS behind this site.
    </p>
  </div>

  <ol class="steps">
    <li class:active={step === "email"} class:done={step !== "email"}>
      <span class="step-no">1</span> Register
    </li>
    <li
      class:active={step === "otp"}
      class:done={step === "done"}
    >
      <span class="step-no">2</span> Verify email
    </li>
    <li class:active={step === "done"}>
      <span class="step-no">3</span> Connect &amp; subscribe
    </li>
  </ol>

  <div class="panel">
    {#if step === "email"}
      <form method="POST" action="?/request" class="form">
        <div class="form-icon"><Mail size={20} strokeWidth={1.6} /></div>
        <h2>Create your workspace</h2>
        <p class="form-hint">
          We email a 6-digit code to confirm it is you. No password needed yet.
        </p>
        <label class="field">
          <span class="field-label">Your email</span>
          <input
            class="field-input"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form?.email ?? ""}
            required
          />
        </label>
        {#if form?.error}
          <p class="notice notice--error">{form.error}</p>
        {/if}
        <button class="btn-site btn-site--primary btn-site--lg" type="submit">
          Send verification code
        </button>
      </form>
    {:else if step === "otp"}
      <form method="POST" action="?/verify" class="form">
        <div class="form-icon"><KeyRound size={20} strokeWidth={1.6} /></div>
        <h2>Enter the code</h2>
        <p class="form-hint">
          We sent a 6-digit code to <strong>{form?.email}</strong>. It expires in
          10 minutes.
        </p>
        <input type="hidden" name="email" value={form?.email ?? ""} />
        <label class="field">
          <span class="field-label">Verification code</span>
          <input
            class="field-input otp"
            type="text"
            name="otp"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="6"
            placeholder="000000"
            required
          />
        </label>
        {#if form?.error}
          <p class="notice notice--error">{form.error}</p>
        {/if}
        <button class="btn-site btn-site--primary btn-site--lg" type="submit">
          Verify &amp; create workspace
        </button>
        <a class="form-back" href="/setup">← Use a different email</a>
      </form>
    {:else if step === "done" && form?.companyId}
      <div class="form">
        <div class="form-icon done"><Check size={20} strokeWidth={2.2} /></div>
        <h2>Workspace ready</h2>
        <p class="form-hint">
          Your FavCRM workspace is live on the free plan.
        </p>

        {#if form.domainRegistered}
          <div class="finish-step">
            <span class="finish-no">✓</span>
            <div>
              <strong>Site connected</strong>
              <p>
                <code>{form.hostname}</code> is now linked to your workspace —
                no environment variable, no redeploy. Reload your site and the
                blog reads live content straight from FavCRM.
              </p>
              <a class="btn-site btn-site--primary" href="/">
                Go to your blog →
              </a>
            </div>
          </div>
        {:else}
          <div class="finish-step">
            <span class="finish-no">A</span>
            <div>
              <strong>Connect this site</strong>
              {#if form.isLocalHost}
                <p>
                  You ran setup on <code>localhost</code>, so the domain could
                  not be auto-registered. After deploying, re-run
                  <code>/setup</code> on the live URL — or add this environment
                  variable in Vercel and redeploy:
                </p>
              {:else}
                <p>
                  Automatic domain connection didn&rsquo;t complete. Add this
                  environment variable in your Vercel project (Settings →
                  Environment Variables), then redeploy:
                </p>
              {/if}
              <button
                class="id-box"
                type="button"
                onclick={() => copyId(form.companyId)}
              >
                <code>VITE_FAVCRM_COMPANY_ID={form.companyId}</code>
                {#if copied}
                  <Check size={15} strokeWidth={2} />
                {:else}
                  <Copy size={15} strokeWidth={1.6} />
                {/if}
              </button>
            </div>
          </div>
        {/if}

        <div class="finish-step">
          <span class="finish-no">{form.domainRegistered ? "+" : "B"}</span>
          <div>
            <strong>Pick a plan</strong>
            <p>
              You are on the free plan — enough to publish. Upgrade anytime for
              more posts, custom domains, and analytics from the FavCRM billing
              dashboard.
            </p>
            <a
              class="btn-site btn-site--secondary"
              href="https://app.favcrm.io/settings/billing"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open billing &amp; plans →
            </a>
          </div>
        </div>

        <p class="key-warn">
          A workspace API key was also issued. Keep it private — set your portal
          password at <a
            href="https://app.favcrm.io"
            target="_blank"
            rel="noopener noreferrer">app.favcrm.io</a
          > to manage the workspace and admin login.
        </p>
      </div>
    {/if}
  </div>

  <p class="setup-foot">
    Already have a workspace? Copy its ID from
    <a href="https://app.favcrm.io" target="_blank" rel="noopener noreferrer">
      app.favcrm.io
    </a>
    and set <code>VITE_FAVCRM_COMPANY_ID</code>.
  </p>
</section>

<style>
  .setup {
    max-width: 640px;
    padding-top: clamp(40px, 6vw, 80px);
  }
  .setup-rule {
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .setup-intro h1 {
    margin: 14px 0 0;
    font-family: var(--font-display);
    font-weight: 800;
    font-size: clamp(2.4rem, 6vw, 3.8rem);
    line-height: 0.92;
    letter-spacing: -0.04em;
    text-transform: uppercase;
    color: var(--ink);
  }
  .setup-intro p {
    margin: 1rem 0 0;
    color: var(--ink-soft);
    font-size: 1.02rem;
    line-height: 1.6;
  }
  .setup-intro strong {
    color: var(--ink);
  }
  .steps {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 20px;
    margin: clamp(28px, 4vw, 40px) 0 0;
    padding: 0;
    list-style: none;
  }
  .steps li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.82rem;
    color: var(--muted);
  }
  .steps li.active {
    color: var(--ink);
  }
  .step-no {
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 1px solid var(--line);
    font-size: 0.74rem;
  }
  .steps li.active .step-no {
    background: var(--ink);
    color: var(--accent-ink);
    border-color: var(--ink);
  }
  .steps li.done .step-no {
    background: var(--accent);
    color: var(--accent-ink);
    border-color: var(--accent);
  }
  .panel {
    margin-top: 20px;
    padding: clamp(24px, 4vw, 40px);
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--radius-card);
  }
  .form {
    display: grid;
    gap: 14px;
  }
  .form-icon {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--accent-soft);
    color: var(--accent);
  }
  .form-icon.done {
    background: var(--ink);
    color: var(--accent-ink);
  }
  .form h2 {
    margin: 4px 0 0;
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1.7rem;
    letter-spacing: -0.025em;
    text-transform: uppercase;
    color: var(--ink);
  }
  .form-hint {
    margin: 0;
    color: var(--muted);
    font-size: 0.92rem;
    line-height: 1.55;
  }
  .form-hint strong {
    color: var(--ink);
  }
  .otp {
    font-family: var(--font-mono);
    font-size: 1.3rem;
    letter-spacing: 0.4em;
    text-align: center;
  }
  .form-back {
    font-size: 0.84rem;
    color: var(--muted);
  }
  .finish-step {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 14px;
    padding-top: 18px;
    border-top: 1px solid var(--line);
  }
  .finish-no {
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: var(--ink);
    color: var(--accent-ink);
    font-size: 0.8rem;
  }
  .finish-step strong {
    color: var(--ink);
    font-size: 1rem;
  }
  .finish-step p {
    margin: 4px 0 10px;
    color: var(--muted);
    font-size: 0.9rem;
    line-height: 1.55;
  }
  .id-box {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 11px 13px;
    background: var(--paper);
    border: 1px solid var(--line);
    border-radius: var(--radius-card);
    cursor: pointer;
    text-align: left;
  }
  .id-box code {
    flex: 1;
    font-family: var(--font-mono);
    font-size: 0.76rem;
    color: var(--ink);
    word-break: break-all;
  }
  .id-box :global(svg) {
    flex-shrink: 0;
    color: var(--accent);
  }
  .key-warn {
    margin: 6px 0 0;
    padding: 11px 13px;
    background: var(--accent-soft);
    border-radius: var(--radius-card);
    font-size: 0.84rem;
    line-height: 1.5;
    color: var(--ink-soft);
  }
  .key-warn a {
    color: var(--accent);
    text-decoration: underline;
  }
  .setup-foot {
    margin-top: 22px;
    font-size: 0.86rem;
    color: var(--muted);
  }
  .setup-foot a {
    color: var(--accent);
    text-decoration: underline;
  }
  .setup-foot code {
    font-family: var(--font-mono);
    font-size: 0.85em;
  }
</style>

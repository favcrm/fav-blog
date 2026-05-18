<script lang="ts">
  import SiteHeader from "$lib/components/site/SiteHeader.svelte";
  import SiteFooter from "$lib/components/site/SiteFooter.svelte";
  import ToastViewport from "$lib/components/site/ToastViewport.svelte";
  import type { Snippet } from "svelte";
  import type { LayoutData } from "./$types";

  let { data, children }: { data: LayoutData; children: Snippet } = $props();

  const brandName = $derived(data.tenant.brandName);
  const brandTagline = $derived(data.tenant.brandTagline);
  const brandLogoUrl = $derived(data.tenant.brandLogoUrl);
  const isLive = $derived(data.tenant.isLive);
</script>

<svelte:head>
  <title>{brandName}</title>
  <meta name="description" content={data.tenant.brandDescription} />
</svelte:head>

<div class="site">
  <SiteHeader {brandName} {brandLogoUrl} {isLive} />
  <main>
    {@render children()}
  </main>
  <SiteFooter {brandName} tagline={brandTagline} />
  <ToastViewport />
</div>

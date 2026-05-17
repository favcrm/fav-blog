<script lang="ts">
  import { onMount } from 'svelte';
  import { adminSettingsApi, type AnalyticsConfig } from '$lib/api/admin';
  import { BarChart3, Tag, Globe, CheckCircle2, Circle, Loader2, Save } from 'lucide-svelte';

  let config = $state<AnalyticsConfig>({ gtmId: null, ga4Id: null, metaPixelId: null });
  let loading = $state(true);
  let saving = $state(false);
  let error = $state('');
  let success = $state(false);

  // Form fields
  let gtmId = $state('');
  let ga4Id = $state('');
  let metaPixelId = $state('');

  onMount(async () => {
    try {
      config = await adminSettingsApi.getAnalytics();
      gtmId = config.gtmId ?? '';
      ga4Id = config.ga4Id ?? '';
      metaPixelId = config.metaPixelId ?? '';
    } catch {
      error = 'Failed to load analytics settings';
    } finally {
      loading = false;
    }
  });

  async function handleSave() {
    saving = true;
    error = '';
    success = false;
    try {
      config = await adminSettingsApi.updateAnalytics({
        gtmId: gtmId.trim() || null,
        ga4Id: ga4Id.trim() || null,
        metaPixelId: metaPixelId.trim() || null,
      });
      success = true;
      setTimeout(() => { success = false; }, 3000);
    } catch {
      error = 'Failed to save settings';
    } finally {
      saving = false;
    }
  }
</script>

<div class="mb-8">
  <div class="flex items-center gap-3 mb-2">
    <div class="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
      <BarChart3 class="w-4 h-4 text-slate-300" />
    </div>
    <h1 class="text-xl font-semibold text-gray-900">Analytics & Tracking</h1>
  </div>
  <p class="text-sm text-gray-500 ml-11">
    Connect GTM, GA4, and Meta Pixel to the member portal.
  </p>
</div>

{#if loading}
  <div class="flex items-center gap-3 py-12 text-gray-400">
    <Loader2 class="w-5 h-5 animate-spin" />
    <span class="text-sm">Loading…</span>
  </div>
{:else}
  <!-- Status bar -->
  <div class="grid grid-cols-3 gap-3 mb-8">
    {#each [
      { label: 'GTM', value: config.gtmId, icon: Tag },
      { label: 'GA4', value: config.ga4Id, icon: BarChart3 },
      { label: 'Meta Pixel', value: config.metaPixelId, icon: Globe },
    ] as tracker}
      <div class="bg-white border border-gray-200 rounded-xl p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">{tracker.label}</span>
          {#if tracker.value}
            <CheckCircle2 class="w-4 h-4 text-emerald-500" />
          {:else}
            <Circle class="w-4 h-4 text-gray-300" />
          {/if}
        </div>
        {#if tracker.value}
          <code class="text-xs font-mono text-gray-700 break-all">{tracker.value}</code>
        {:else}
          <span class="text-xs text-gray-400 italic">Not configured</span>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Form -->
  <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
      <h2 class="text-sm font-semibold text-gray-700">Tracking IDs</h2>
    </div>

    <div class="p-6 space-y-6">
      <!-- GTM -->
      <div>
        <label for="gtm-id" class="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
          Google Tag Manager
        </label>
        <input
          id="gtm-id"
          type="text"
          bind:value={gtmId}
          placeholder="GTM-XXXXXXX"
          class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm font-mono text-gray-900 placeholder-gray-400
                 focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-400 transition-all"
        />
        <p class="mt-1.5 text-xs text-gray-400">Recommended — routes GA4 + other tags. Skip GA4 below when using GTM.</p>
      </div>

      <!-- GA4 -->
      <div>
        <label for="ga4-id" class="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
          GA4 Measurement ID
        </label>
        <input
          id="ga4-id"
          type="text"
          bind:value={ga4Id}
          placeholder="G-XXXXXXXXXX"
          class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm font-mono text-gray-900 placeholder-gray-400
                 focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-400 transition-all"
        />
        <p class="mt-1.5 text-xs text-gray-400">Direct GA4 only — leave blank if you are using GTM.</p>
      </div>

      <!-- Meta Pixel -->
      <div>
        <label for="pixel-id" class="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
          Meta Pixel ID
        </label>
        <input
          id="pixel-id"
          type="text"
          bind:value={metaPixelId}
          placeholder="1234567890123456"
          class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm font-mono text-gray-900 placeholder-gray-400
                 focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-400 transition-all"
        />
        <p class="mt-1.5 text-xs text-gray-400">Facebook / Instagram Pixel — tracks PageView, Purchase, Lead.</p>
      </div>

      {#if error}
        <p class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{error}</p>
      {/if}

      <!-- Actions -->
      <div class="flex items-center justify-between pt-2 border-t border-gray-100">
        <div class="flex items-center gap-2 text-sm text-emerald-600 transition-all duration-300"
             class:opacity-0={!success}
             class:opacity-100={success}>
          <CheckCircle2 class="w-4 h-4" />
          <span>Saved</span>
        </div>
        <button
          onclick={handleSave}
          disabled={saving}
          class="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed
                 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          {#if saving}
            <Loader2 class="w-4 h-4 animate-spin" />
            Saving…
          {:else}
            <Save class="w-4 h-4" />
            Save Changes
          {/if}
        </button>
      </div>
    </div>
  </div>

  <!-- Tracked events reference -->
  <div class="mt-6 bg-white border border-gray-200 rounded-xl p-5">
    <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Tracked Events</h3>
    <div class="flex flex-wrap gap-2">
      {#each ['page_view', 'purchase', 'sign_up', 'login', 'booking_complete'] as evt}
        <code class="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-mono">{evt}</code>
      {/each}
    </div>
  </div>
{/if}

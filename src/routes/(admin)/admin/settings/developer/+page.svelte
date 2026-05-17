<script lang="ts">
  import { seedDemoData, seedTotals, type SeedProgress } from '$lib/api/seed';
  import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
  import { Sparkles, AlertCircle, Package, CalendarDays, Ticket, CheckCircle2, Circle, Loader2, Code } from 'lucide-svelte';

  let seedScope = $state({ products: true, services: true, events: true });
  let seeding = $state(false);
  let seedProgress = $state<SeedProgress | null>(null);
  let seedSummary = $state<string>('');
  let seedErrors = $state<string[]>([]);
  let seedConfirmOpen = $state(false);

  function requestSeed() {
    seedConfirmOpen = true;
  }

  async function runSeed() {
    seedConfirmOpen = false;
    seeding = true;
    seedSummary = '';
    seedErrors = [];
    seedProgress = null;
    try {
      const result = await seedDemoData(seedScope, (p) => {
        seedProgress = p;
      });
      const parts: string[] = [];
      if (result.categoriesCreated) parts.push(`${result.categoriesCreated} categories`);
      if (result.productsCreated) parts.push(`${result.productsCreated} products`);
      if (result.servicesCreated) parts.push(`${result.servicesCreated} services`);
      if (result.eventsCreated) parts.push(`${result.eventsCreated} events`);
      seedSummary = parts.length ? `Created ${parts.join(', ')}.` : 'Nothing created.';
      seedErrors = result.errors;
    } catch (err) {
      seedErrors = [err instanceof Error ? err.message : 'Seed failed'];
    } finally {
      seeding = false;
      seedProgress = null;
    }
  }
</script>

<div class="mb-8">
  <div class="flex items-center gap-3 mb-2">
    <div class="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
      <Code class="w-4 h-4 text-slate-300" />
    </div>
    <h1 class="text-xl font-semibold text-gray-900">Developer Options</h1>
  </div>
  <p class="text-sm text-gray-500 ml-11">
    Tools for testing and configuring the workspace.
  </p>
</div>

<div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
  <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
    <h3 class="text-sm font-semibold text-gray-700">Seed sample content</h3>
  </div>

  <div class="p-6 space-y-5">
    <div class="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
      <AlertCircle class="w-4 h-4 mt-0.5 flex-shrink-0" />
      <span>Re-running creates duplicates. Use on a fresh workspace.</span>
    </div>

    <div class="grid grid-cols-3 gap-3">
      {#each [
        { key: 'products', label: 'Catalog', icon: Package, hint: `${seedTotals.categories} categories · ${seedTotals.products} products` },
        { key: 'services', label: 'Bookings', icon: CalendarDays, hint: `${seedTotals.services} services` },
        { key: 'events', label: 'Events', icon: Ticket, hint: `${seedTotals.events} events` },
      ] as opt}
        <label class="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-gray-300 transition-colors block">
          <input
            type="checkbox"
            bind:checked={seedScope[opt.key as 'products' | 'services' | 'events']}
            class="sr-only"
          />
          <div class="flex items-center justify-between mb-2">
            <span class="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <opt.icon class="w-3.5 h-3.5" />
              {opt.label}
            </span>
            {#if seedScope[opt.key as 'products' | 'services' | 'events']}
              <CheckCircle2 class="w-4 h-4 text-emerald-500" />
            {:else}
              <Circle class="w-4 h-4 text-gray-300" />
            {/if}
          </div>
          <span class="text-xs text-gray-600">{opt.hint}</span>
        </label>
      {/each}
    </div>

    {#if seeding && seedProgress}
      <div class="space-y-2">
        <div class="flex items-center justify-between text-xs text-gray-500">
          <span>{seedProgress.step}</span>
          <span>{seedProgress.done} / {seedProgress.total}</span>
        </div>
        <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            class="h-full bg-slate-800 transition-all"
            style:width={`${(seedProgress.done / Math.max(seedProgress.total, 1)) * 100}%`}
          ></div>
        </div>
      </div>
    {/if}

    {#if seedSummary}
      <div class="flex items-start gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
        <CheckCircle2 class="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>{seedSummary}</span>
      </div>
    {/if}

    {#if seedErrors.length}
      <div class="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 space-y-1">
        <div class="flex items-center gap-2 font-medium">
          <AlertCircle class="w-4 h-4" />
          <span>{seedErrors.length} item{seedErrors.length === 1 ? '' : 's'} failed</span>
        </div>
        <ul class="text-xs space-y-0.5 ml-6 list-disc">
          {#each seedErrors as err}
            <li>{err}</li>
          {/each}
        </ul>
      </div>
    {/if}

    <div class="flex justify-end pt-2 border-t border-gray-100">
      <button
        onclick={requestSeed}
        disabled={seeding || (!seedScope.products && !seedScope.services && !seedScope.events)}
        class="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed
               text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        {#if seeding}
          <Loader2 class="w-4 h-4 animate-spin" />
          Seeding…
        {:else}
          <Sparkles class="w-4 h-4" />
          Seed demo data
        {/if}
      </button>
    </div>
  </div>
</div>

<ConfirmDialog
  bind:open={seedConfirmOpen}
  title="Seed demo data?"
  message="This adds sample categories, products, services, and events to the workspace. Re-running creates duplicates — use only on a fresh workspace."
  confirmLabel="Seed data"
  confirmVariant="primary"
  onConfirm={runSeed}
  onCancel={() => (seedConfirmOpen = false)}
/>
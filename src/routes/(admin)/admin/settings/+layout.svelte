<script lang="ts">
  import { page } from '$app/stores';
  import { Settings, BarChart3, Code } from 'lucide-svelte';

  let { children } = $props();

  const nav = [
    { name: 'General', href: '/admin/settings/general', icon: Settings },
    { name: 'Analytics', href: '/admin/settings/analytics', icon: BarChart3 },
    { name: 'Developer', href: '/admin/settings/developer', icon: Code },
  ];
</script>

<div class="flex flex-col md:flex-row gap-8 items-start max-w-5xl">
  <aside class="w-full md:w-56 flex-shrink-0">
    <nav class="space-y-1">
      {#each nav as item}
        <a 
          href={item.href} 
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors {$page.url.pathname.startsWith(item.href) ? 'bg-slate-100 text-slate-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}"
        >
          <item.icon class="w-4 h-4" />
          {item.name}
        </a>
      {/each}
    </nav>
  </aside>
  
  <main class="flex-1 w-full min-w-0">
    {@render children()}
  </main>
</div>

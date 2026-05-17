<script lang="ts">
  import { PackageSearch } from "lucide-svelte";

  // Lucide icons are still Svelte 4 class components; relax typing.
  type IconComponent = typeof PackageSearch;

  let {
    icon: Icon = PackageSearch,
    title = "Nothing here yet",
    description = "",
  }: {
    icon?: IconComponent;
    title?: string;
    description?: string;
  } = $props();
</script>

<div class="site-empty">
  <span class="empty-mark">
    <Icon size={22} strokeWidth={1.6} />
  </span>
  <h3>{title}</h3>
  {#if description}
    <p>{description}</p>
  {/if}
</div>

<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    children,
    as = "div",
    class: className = "",
  }: { children: Snippet; as?: string; class?: string } = $props();
</script>

<svelte:element this={as} class={`site-container ${className}`}>
  {@render children()}
</svelte:element>

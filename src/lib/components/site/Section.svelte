<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    children,
    bordered = false,
    tight = false,
    class: className = "",
  }: {
    children: Snippet;
    bordered?: boolean;
    tight?: boolean;
    class?: string;
  } = $props();
</script>

<section
  class={`site-section ${bordered ? "site-section--bordered" : ""} ${tight ? "site-section--tight" : ""} ${className}`}
>
  <div class="site-container">
    {@render children()}
  </div>
</section>

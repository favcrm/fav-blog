<script lang="ts">
  import type { Snippet } from "svelte";

  type Variant = "primary" | "secondary" | "ghost";
  type Size = "md" | "lg";

  let {
    children,
    href,
    type = "button",
    variant = "primary",
    size = "md",
    disabled = false,
    onclick,
    class: className = "",
    ariaLabel,
  }: {
    children: Snippet;
    href?: string;
    type?: "button" | "submit" | "reset";
    variant?: Variant;
    size?: Size;
    disabled?: boolean;
    onclick?: (event: MouseEvent) => void;
    class?: string;
    ariaLabel?: string;
  } = $props();

  const cls = $derived(
    `btn-site btn-site--${variant} ${size === "lg" ? "btn-site--lg" : ""} ${className}`,
  );
</script>

{#if href}
  <a {href} class={cls} aria-label={ariaLabel} {onclick}>
    {@render children()}
  </a>
{:else}
  <button {type} class={cls} {disabled} aria-label={ariaLabel} {onclick}>
    {@render children()}
  </button>
{/if}

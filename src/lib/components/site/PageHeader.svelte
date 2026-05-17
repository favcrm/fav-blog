<script lang="ts">
  import Eyebrow from "./Eyebrow.svelte";

  let {
    eyebrow,
    title,
    lead = "",
    display = false,
  }: {
    eyebrow: string;
    title: string;
    lead?: string;
    display?: boolean;
  } = $props();
</script>

<header class="page-header site-container">
  <Eyebrow>{eyebrow}</Eyebrow>
  <h1 class={`site-h1 ${display ? "site-h1--display" : ""}`}>{title}</h1>
  {#if lead}
    <p class="site-lead">{lead}</p>
  {/if}
</header>

<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  let {
    label,
    name,
    value = $bindable(""),
    type = "text",
    placeholder = "",
    autocomplete,
    inputmode,
    required = false,
    rows,
  }: {
    label: string;
    name: string;
    value?: string;
    type?: string;
    placeholder?: string;
    autocomplete?: HTMLInputAttributes["autocomplete"];
    inputmode?: HTMLInputAttributes["inputmode"];
    required?: boolean;
    rows?: number;
  } = $props();

  const id = $derived(`field-${name}`);
  const isTextarea = $derived(type === "textarea");
</script>

<div class="field">
  <label class="field-label" for={id}>{label}</label>
  {#if isTextarea}
    <textarea
      {id}
      {name}
      class="field-input"
      {placeholder}
      {autocomplete}
      rows={rows ?? 5}
      {required}
      bind:value
    ></textarea>
  {:else}
    <input
      {id}
      {name}
      class="field-input"
      {type}
      {placeholder}
      {autocomplete}
      {inputmode}
      {required}
      bind:value
    />
  {/if}
</div>

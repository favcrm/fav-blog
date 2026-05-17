<script lang="ts">
  interface Option {
    value: string;
    label: string;
  }

  let {
    label,
    name,
    value = $bindable(""),
    options,
    placeholder = "Select…",
    required = false,
    autocomplete,
  }: {
    label: string;
    name: string;
    value?: string;
    options: Option[];
    placeholder?: string;
    required?: boolean;
    autocomplete?: string;
  } = $props();

  const id = $derived(`select-${name}`);
</script>

<div class="field">
  <label class="field-label" for={id}>{label}</label>
  <select
    {id}
    {name}
    class="field-input field-select"
    {required}
    autocomplete={autocomplete as never}
    bind:value
  >
    <option value="" disabled>{placeholder}</option>
    {#each options as opt (opt.value)}
      <option value={opt.value}>{opt.label}</option>
    {/each}
  </select>
</div>

<style>
  .field-select {
    appearance: none;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23111' stroke-width='2'><polyline points='6 9 12 15 18 9'/></svg>");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 36px;
  }
</style>

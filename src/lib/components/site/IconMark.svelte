<script lang="ts">
  let {
    name = "",
    size = 32,
  }: { name?: string | null; size?: number } = $props();

  const letter = $derived((name ?? "").trim().slice(0, 1).toUpperCase() || "•");
</script>

<span class="brand-mark" aria-hidden="true" style:width={`${size}px`} style:height={`${size}px`}>
  <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
    <text
      x="50%"
      y="50%"
      text-anchor="middle"
      dominant-baseline="central"
      font-family="Fraunces, Georgia, serif"
      font-size="20"
      font-weight="500"
      letter-spacing="-0.02em"
      fill="currentColor"
    >{letter}</text>
  </svg>
</span>

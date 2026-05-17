<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";

  interface Props {
    open: boolean;
    title?: string;
    message?: string;
    confirmLabel?: string;
    confirmVariant?: "primary" | "danger";
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }

  let {
    open = $bindable(false),
    title = "Are you sure?",
    message = "",
    confirmLabel = "Confirm",
    confirmVariant = "danger",
    loading = false,
    onConfirm,
    onCancel,
  }: Props = $props();

  function handleOverlay(e: MouseEvent) {
    if (e.target === e.currentTarget) onCancel();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") onCancel();
  }
</script>

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
    onclick={handleOverlay}
    onkeydown={handleKeydown}
    role="dialog"
    tabindex="-1"
    aria-modal="true"
    aria-label={title}
  >
    <div class="bg-white rounded-xl shadow-xl w-full max-w-sm animate-scale-in p-6">
      <h3 class="text-base font-semibold text-gray-900 mb-2">{title}</h3>
      {#if message}
        <p class="text-sm text-gray-500 mb-5">{message}</p>
      {/if}
      <div class="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onclick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant={confirmVariant} size="sm" onclick={onConfirm} disabled={loading}>
          {loading ? "..." : confirmLabel}
        </Button>
      </div>
    </div>
  </div>
{/if}

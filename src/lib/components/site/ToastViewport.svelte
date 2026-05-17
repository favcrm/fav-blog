<script lang="ts">
  import { fly } from "svelte/transition";
  import { toasts, type Toast } from "$lib/stores/toast";
  import { Check, Info, X } from "lucide-svelte";

  function runAction(toast: Toast) {
    toast.action?.onPress();
    toasts.dismiss(toast.id);
  }
</script>

<div class="toast-viewport" aria-live="polite" aria-atomic="true">
  {#each $toasts as toast (toast.id)}
    <div
      class="toast toast--{toast.tone}"
      transition:fly={{ y: 12, duration: 180 }}
      role="status"
    >
      <span class="toast-icon" aria-hidden="true">
        {#if toast.tone === "success"}
          <Check size={14} strokeWidth={2} />
        {:else if toast.tone === "error"}
          <X size={14} strokeWidth={2} />
        {:else}
          <Info size={14} strokeWidth={2} />
        {/if}
      </span>
      <span class="toast-msg">{toast.message}</span>
      {#if toast.action}
        <button
          class="toast-action"
          type="button"
          onclick={() => runAction(toast)}
        >
          {toast.action.label}
        </button>
      {/if}
      <button
        class="toast-close"
        type="button"
        aria-label="Dismiss"
        onclick={() => toasts.dismiss(toast.id)}
      >
        <X size={12} strokeWidth={2} />
      </button>
    </div>
  {/each}
</div>

<style>
  .toast-viewport {
    position: fixed;
    bottom: 24px;
    right: 24px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 70;
    pointer-events: none;
    max-width: calc(100vw - 48px);
  }
  .toast {
    pointer-events: auto;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: var(--ink, #111);
    color: var(--paper, #ffffff);
    padding: 10px 12px 10px 14px;
    border-radius: 8px;
    font-size: 13px;
    box-shadow: 0 8px 24px rgb(17 17 17 / 18%);
    min-width: 240px;
  }
  .toast--success {
    background: #14532d;
  }
  .toast--error {
    background: #991b1b;
  }
  .toast-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.18);
    flex-shrink: 0;
  }
  .toast-msg {
    flex: 1;
    line-height: 1.35;
  }
  .toast-action {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    background: rgba(255, 255, 255, 0.16);
    padding: 4px 10px;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    transition: background 120ms;
  }
  .toast-action:hover {
    background: rgba(255, 255, 255, 0.28);
  }
  .toast-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    color: rgba(255, 255, 255, 0.7);
    background: transparent;
    transition: color 120ms, background 120ms;
  }
  .toast-close:hover {
    color: white;
    background: rgba(255, 255, 255, 0.12);
  }
</style>

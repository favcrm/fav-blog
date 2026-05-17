<script lang="ts">
	import { clsx } from 'clsx';
	import { X } from 'lucide-svelte';
	import type { Snippet } from 'svelte';
	import { m } from '$lib/stores/language';

	interface Props {
		open?: boolean;
		title?: string;
		class?: string;
		children: Snippet;
		footer?: Snippet;
	}

	let {
		open = $bindable(false),
		title = '',
		class: className = '',
		children,
		footer
	}: Props = $props();

	function close() {
		open = false;
	}

	function handleOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			close();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			close();
		}
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
		onclick={handleOverlayClick}
		onkeydown={handleKeydown}
		role="dialog"
		tabindex="-1"
		aria-modal="true"
		aria-label={title}
	>
		<div class={clsx('card w-full max-w-lg animate-scale-in', className)}>
			{#if title}
				<div class="flex items-center justify-between p-5 border-b border-slate-200">
					<h2 class="text-lg font-semibold text-slate-900">{title}</h2>
					<button
						onclick={close}
						class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
						aria-label={m.aria_close()}
					>
						<X class="w-5 h-5" />
					</button>
				</div>
			{/if}

			<div class="p-5">
				{@render children()}
			</div>

			{#if footer}
				<div class="px-5 py-4 border-t border-slate-200 bg-slate-50 rounded-b-lg">
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}

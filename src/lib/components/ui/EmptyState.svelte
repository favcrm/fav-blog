<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		message?: string;
		icon?: Snippet;
		actions?: Snippet;
	}

	let { title, message = '', icon, actions }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center py-16 px-6">
	{#if icon}
		<div class="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
			<div class="text-gray-400">
				{@render icon()}
			</div>
		</div>
	{:else}
		<div class="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
			<svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
			</svg>
		</div>
	{/if}
	<h3 class="text-sm font-semibold text-gray-900">{title}</h3>
	{#if message}
		<p class="text-sm text-gray-500 mt-1 max-w-xs text-center">{message}</p>
	{/if}
	{#if actions}
		<div class="mt-5">
			{@render actions()}
		</div>
	{/if}
</div>

<script lang="ts">
	import { Search, X } from 'lucide-svelte';
	import { clsx } from 'clsx';
	import { m } from '$lib/stores/language';

	interface Props {
		value?: string;
		placeholder?: string;
		class?: string;
	}

	let {
		value = $bindable(''),
		placeholder = 'Search...',
		class: className
	}: Props = $props();
</script>

<div class={clsx('relative', className)}>
	<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
	<input type="text" bind:value {placeholder} class="form-input" style="padding-left: 2.5rem; padding-right: 2.25rem;" />
	{#if value}
		<button
			type="button"
			onclick={() => {
				value = '';
			}}
			class="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 transition-colors"
			aria-label={m.aria_clear_search()}
		>
			<X class="w-3.5 h-3.5" />
		</button>
	{/if}
</div>

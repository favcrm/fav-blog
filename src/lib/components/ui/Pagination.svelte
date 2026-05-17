<script lang="ts">
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { m } from '$lib/stores/language';

	interface Props {
		currentPage: number;
		totalPages: number;
		onPageChange: (page: number) => void;
	}

	let { currentPage, totalPages, onPageChange }: Props = $props();

	let pages = $derived.by(() => {
		const result: (number | '...')[] = [];
		if (totalPages <= 7) {
			for (let i = 1; i <= totalPages; i++) result.push(i);
		} else {
			result.push(1);
			if (currentPage > 3) result.push('...');
			for (
				let i = Math.max(2, currentPage - 1);
				i <= Math.min(totalPages - 1, currentPage + 1);
				i++
			) {
				result.push(i);
			}
			if (currentPage < totalPages - 2) result.push('...');
			result.push(totalPages);
		}
		return result;
	});
</script>

{#if totalPages > 1}
	<nav class="flex items-center justify-center gap-1" aria-label="Pagination">
		<button
			onclick={() => onPageChange(currentPage - 1)}
			disabled={currentPage <= 1}
			class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
			aria-label={m.aria_previous_page()}
		>
			<ChevronLeft class="w-4 h-4" />
		</button>

		{#each pages as pg}
			{#if pg === '...'}
				<span class="px-2 text-sm text-slate-400">...</span>
			{:else}
				<button
					onclick={() => onPageChange(pg)}
					class="min-w-[2rem] h-8 rounded-lg text-sm font-medium transition-colors"
					class:bg-green-700={pg === currentPage}
					class:text-white={pg === currentPage}
					class:text-slate-600={pg !== currentPage}
					class:hover:bg-slate-100={pg !== currentPage}
					aria-current={pg === currentPage ? 'page' : undefined}
				>
					{pg}
				</button>
			{/if}
		{/each}

		<button
			onclick={() => onPageChange(currentPage + 1)}
			disabled={currentPage >= totalPages}
			class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
			aria-label={m.aria_next_page()}
		>
			<ChevronRight class="w-4 h-4" />
		</button>
	</nav>
{/if}

<script lang="ts">
	interface Props {
		lines?: number;
	}

	let { lines = 3 }: Props = $props();
</script>

<div class="space-y-3 animate-pulse">
	{#each {length: lines} as _, i}
		<div
			class="h-4 bg-slate-200 rounded"
			style="width: {i === lines - 1 ? '60%' : i % 2 === 0 ? '100%' : '80%'}"
		></div>
	{/each}
</div>

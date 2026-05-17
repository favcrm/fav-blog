<script lang="ts">
	import { clsx } from 'clsx';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children: Snippet;
	}

	let { class: className = '', children }: Props = $props();
</script>

<div class={clsx('card', className)}>
	{@render children()}
</div>

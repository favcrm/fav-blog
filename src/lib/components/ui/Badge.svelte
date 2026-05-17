<script lang="ts">
	import { clsx } from 'clsx';
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
		class?: string;
		children: Snippet;
	}

	let { variant = 'default', class: className = '', children }: Props = $props();

	const variantClasses: Record<string, string> = {
		success: 'bg-green-100 text-green-700',
		warning: 'bg-amber-100 text-amber-700',
		error: 'bg-red-100 text-red-700',
		info: 'bg-blue-100 text-blue-700',
		default: 'bg-slate-100 text-slate-700'
	};
</script>

<span class={clsx('status-badge', variantClasses[variant], className)}>
	{@render children()}
</span>

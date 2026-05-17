<script lang="ts">
	import { clsx } from 'clsx';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		class?: string;
		children: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const variantClasses: Record<string, string> = {
		primary: 'btn-primary',
		secondary: 'btn-secondary',
		outline: 'btn-outline',
		ghost: 'btn-ghost',
		danger: 'btn-danger'
	};

	const sizeClasses: Record<string, string> = {
		sm: 'px-3 py-1.5 text-sm',
		md: '',
		lg: 'px-6 py-3 text-base'
	};

	let classes = $derived(
		clsx(
			variantClasses[variant],
			sizeClasses[size],
			'inline-flex items-center justify-center gap-2',
			className
		)
	);
</script>

<button class={classes} {...rest}>
	{@render children()}
</button>

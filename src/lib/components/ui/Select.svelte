<script lang="ts">
	import { clsx } from 'clsx';

	interface Props {
		name: string;
		label?: string;
		value?: string;
		options: { value: string; label: string }[];
		placeholder?: string;
		error?: string;
		required?: boolean;
		disabled?: boolean;
		class?: string;
	}

	let {
		name,
		label,
		value = $bindable(''),
		options,
		placeholder,
		error,
		required = false,
		disabled = false,
		class: className
	}: Props = $props();
</script>

<div class={clsx('space-y-1', className)}>
	{#if label}
		<label for={name} class="form-label">{label}</label>
	{/if}
	<select
		id={name}
		{name}
		bind:value
		aria-required={required}
		aria-invalid={error ? 'true' : undefined}
		{disabled}
		class={clsx('form-input', error && 'border-red-500 focus:border-red-500 focus:ring-red-500/10')}
	>
		{#if placeholder}
			<option value="" disabled>{placeholder}</option>
		{/if}
		{#each options as opt (opt.value)}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>
	{#if error}
		<p class="text-xs text-red-500 mt-1">{error}</p>
	{/if}
</div>

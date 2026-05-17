<script lang="ts">
	import { clsx } from 'clsx';

	interface Props {
		label?: string;
		name: string;
		type?: string;
		value?: string;
		placeholder?: string;
		error?: string;
		hint?: string;
		required?: boolean;
		disabled?: boolean;
		class?: string;
		inputClass?: string;
		oninput?: (event: Event) => void;
	}

	let {
		label,
		name,
		type = 'text',
		value = $bindable(''),
		placeholder = '',
		error = '',
		hint = '',
		required = false,
		disabled = false,
		class: className = '',
		inputClass = '',
		oninput
	}: Props = $props();
</script>

<div class={clsx('space-y-1', className)}>
	{#if label}
		<label for={name} class="form-label">
			{label}
			{#if required}
				<span class="text-red-500 ml-0.5">*</span>
			{/if}
		</label>
	{/if}

	<input
		id={name}
		{name}
		{type}
		bind:value
		{placeholder}
		aria-required={required}
		aria-invalid={error ? 'true' : undefined}
		{disabled}
		{oninput}
		class={clsx(
			'w-full px-4 py-3 bg-slate-50 border focus:ring-0 focus:bg-white text-slate-900 font-medium transition-colors rounded-none',
			error ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-green-700',
			inputClass
		)}
	/>

	{#if error}
		<span class="form-error">{error}</span>
	{:else if hint}
		<span class="form-hint">{hint}</span>
	{/if}
</div>

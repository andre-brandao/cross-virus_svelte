<script lang="ts">
	import type { ComponentType } from 'svelte'
	import type { Icon } from 'lucide-svelte'
	export let href: string = '#'
	export let Icon: ComponentType<Icon> | null = null
	export let label: string = ''
</script>

<a
	{href}
	class="group flex justify-center items-center text-center rounded-md p-2 transition ease-in-out bg-secondary text-white hover:text-black hover:bg-primary hover:shadow-md hover:shadow-primary px-5 "
>
	{#if Icon}
		<svelte:component this={Icon} class="h-5 w-5" />
	{/if}
	<p class="text-center items-center pl-2">{label}</p>
</a>

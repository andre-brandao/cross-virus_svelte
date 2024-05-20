<script lang="ts">
	import Button from '$lib/components/Button.svelte'
	import { MapPinned, FolderPlus } from 'lucide-svelte'
	import type { PageData } from './$types'

	export let data: PageData

	const maps = data.maps
</script>

<main
	class="flex flex-col justify-center items-center bg-gray-100 min-h-full p-4"
>
	<div class="grid gap-3 grid-cols-2 max-md:grid-cols-1">
		{#each maps as mapa}
			<a
				href="maps/{mapa.id}"
				class="grow justify-center text-lg px-11 py-4 bg-white rounded-lg shadow-sm w-full max-md:px-5 hover:shadow-xl transition ease-in-out"
			>
				{mapa.title}
			</a>
		{/each}
	</div>

	<div class="my-4">
		<Button
			href="/maps/create"
			label="Crie um novo mapa a partir de dados CSV"
		/>
	</div>

	<!-- svelte-ignore a11y-missing-attribute -->
	{#if maps.length === 0}
		<div
			class="flex flex-col items-center justify-center w-full"
		>
			<h1>
				Parece que seu municipio ainda não tem um mapa.
				Entre em contato com a prefeitura ou com a equipe
				crossvirus para criarmos um mapa com os dados de
				interesse público.
			</h1>
			<iframe
				class="w-full h-[70vh] my-4"
				src="https://www.crossvirus.com.br/maps/embed"
				frameborder="0"
			></iframe>
		</div>
	{/if}
</main>

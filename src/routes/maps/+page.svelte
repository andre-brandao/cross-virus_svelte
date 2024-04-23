<script lang="ts">
	import Button from '$lib/components/Button.svelte'
	import { MapPinned, FolderPlus } from 'lucide-svelte'
	import type { PageData } from './$types'

	export let data: PageData

	const maps = data.maps
</script>

<main class="flex flex-col justify-center items-center">
	<div class="grid gap-3 grid-cols-2 max-md:grid-cols-1">
		{#each maps as mapa}
			<div
				class="flex justify-between p-2 px-5 rounded bg-gray-200 w-full items-center"
			>
				{mapa.title}
				<div class="ml-1 flex gap-2">
					<a
						href="maps/update/{mapa.id}"
						title="Adicionar dados ao mapa"
						class="hover:bg-secondary hover:text-white transition ease-in-out p-2 rounded-full"
					>
						<FolderPlus />
					</a>
					<a
						href="maps/{mapa.id}"
						title="Visualizar o mapa"
						class="hover:bg-secondary hover:text-white transition ease-in-out p-2 rounded-full"
					>
						<MapPinned /></a
					>
				</div>
			</div>
		{/each}
	</div>
	<div class="my-4">
		<Button
			href="/maps/create"
			label="Crie um novo mapa a partir de dados CSV"
		/>
	</div>
</main>

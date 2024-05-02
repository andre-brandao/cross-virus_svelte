<script lang="ts">
	import Button from '$lib/components/Button.svelte'
	import type { PageData } from './$types'
	import { Map } from 'lucide-svelte'

	export let data: PageData
	const municipio = data.municipio
	const maps = data.maps
	console.log(municipio)
</script>

<main
	class="flex flex-col justify-center items-center md:h-[90vh] bg-gray-100"
>
	<div class="text-center">
		<h1 class="text-3xl font-bold mb-4">
			Bem-vindo à Central Crossvirus de <span
				class="text-primary"
				>{municipio?.nome} - {municipio?.UF}</span
			>
		</h1>
		<h1 class="font-bold text-lg">
			Doencas registradas em {municipio?.nome}:
		</h1>
		<div class=" grid grid-cols-3 gap-2 mb-7 mt-3">
			{#if maps}
				{#each maps as mapa}
					<div class="border-2 rounded p-4">
						<p>{mapa.title}</p>
					</div>
				{/each}
			{:else}
				<h1>Nenhum mapa registrado!</h1>
			{/if}
		</div>
	</div>
	<div class="mb-4">
		<Button
			label={`Acessar mapas de ${municipio?.nome}`}
			href={'/maps'}
			Icon={Map}
		/>
	</div>
	<p class="text-xl font-bold text-gray-600 mb-2">
		Informacões da cidade:
	</p>
	<p class="text-lg text-gray-600">
		Data de criação: {municipio?.created_at}
	</p>
	<p class="text-lg text-gray-600">
		Código do município: {municipio?.CodMun}
	</p>
	<p class="text-lg text-gray-600">
		População estimada: {municipio?.pop_est}
	</p>
	<p class="text-lg text-gray-600">
		Faixa da população: {municipio?.faixa_pop}
	</p>
	<p class="text-lg text-gray-600">
		Região: {municipio?.regiao}
	</p>
	<p class="text-lg text-gray-600">UF: {municipio?.UF}</p>
</main>

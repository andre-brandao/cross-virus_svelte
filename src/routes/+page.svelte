<script lang="ts">
	import Button from '$lib/components/Button.svelte'
	import { onMount } from 'svelte'
	import type { PageData } from './$types'
	import { Map } from 'lucide-svelte'

	export let data: PageData
	const municipio = data.municipio
	const maps = data.maps
	console.log(municipio)

	let casos_doenca: {
		doenca: string
		casos: number
	}[] = []

	let formattedDate: string

	onMount(async () => {
		const resp = await fetch('/api/casos').then((res) =>
			res.json(),
		)
		console.log(resp)

		casos_doenca = resp.map((caso) => {
			return {
				doenca: caso[0],
				casos: caso[1],
			}
		})
		console.log(casos_doenca)

		formatData()
	})

	function formatData() {
		const dateStr = municipio?.created_at
		if (dateStr) {
			formattedDate = new Date(dateStr).toLocaleDateString(
				'pt-BR',
			)
		} else {
			formattedDate = 'Data não disponível'
		}
	}
</script>

<main
	class="flex flex-col items-center md:h-[90vh] bg-gray-100"
>
	<section
		class="mt-11 text-4xl max-md:mt-10 max-md:max-w-full"
	>
		<h1 class="font-medium text-black text-center px-4">
			Bem-vindo à Central Crossvirus de <span
				class="text-primary font-bold"
				>{municipio?.nome} - {municipio?.UF}</span
			>
		</h1>
	</section>
	<section
		class="px-5 mt-14 w-full max-w-[1734px] max-md:mt-10 max-md:max-w-full"
	>
		<div class="flex flex-col md:flex-row gap-8">
			<div class="flex flex-col flex-1">
				<h2 class="text-2xl text-black">
					Informações da cidade:
				</h2>
				<article
					class="p-6 mt-5 bg-white rounded-lg shadow-sm text-xl"
				>
					<p class="pb-3">
						<strong>Data de criação:</strong>
						{formattedDate}
					</p>
					<p class="pb-3">
						<strong>Código do município:</strong>
						{municipio?.CodMun}
					</p>
					<p class="pb-3">
						<strong>População estimada:</strong>
						{municipio?.pop_est}
					</p>
					<p class="pb-3">
						<strong>Faixa da população:</strong>
						{municipio?.faixa_pop}
					</p>
					<p class="pb-3">
						<strong>Região:</strong>
						{municipio?.regiao}
					</p>
					<p><strong>UF:</strong> {municipio?.UF}</p>
				</article>
			</div>

			<div class="flex flex-col flex-1">
				<h3 class="text-2xl text-black">
					Mapas de <strong class="font-medium"
						>{municipio?.nome}:</strong
					>
				</h3>
				<div class="flex flex-col gap-5 mt-5">
					{#if maps}
						{#each maps as mapa}
							<a
								href="maps/{mapa.id}"
								class="grow justify-center text-lg px-11 py-4 bg-white rounded-lg shadow-sm w-full max-md:px-5 hover:shadow-xl transition ease-in-out"
							>
								<p class="text-center">{mapa.title}</p>
							</a>
						{/each}
					{:else}
						<h1>Nenhum mapa registrado!</h1>
					{/if}
				</div>
				<div class="mt-6">
					<Button
						label={`Acessar todos mapas de ${municipio?.nome}`}
						href={'/maps'}
						Icon={Map}
					/>
				</div>
			</div>

			<aside class="flex flex-col flex-1">
				<h3 class="text-2xl text-black">
					Casos notificados de doenças:
				</h3>
				<div
					class="flex flex-col gap-5 justify-between px-8 py-9 mt-5 bg-white rounded-lg shadow-sm text-2xl"
				>
					{#each casos_doenca ?? [] as q_casos}
						<div class="flex justify-between">
							<p class=" text-black">
								{q_casos.doenca}:
							</p>
							<p class=" text-secondary font-bold">
								{q_casos.casos}
							</p>
						</div>
					{/each}
				</div>
			</aside>
		</div>
	</section>
</main>

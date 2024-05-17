<script lang="ts">
	import type { PageData } from './$types'
	import Map from '$lib/ArcGis/ChartMap.svelte'
	import Modal from '$lib/components/Modal.svelte'
	import type { ArcgisFilter } from '$lib/ArcGis/types'
	import SvChart from '$lib/ArcGis/SVChart.svelte'
	import { CircleX } from 'lucide-svelte'

	import AtualizarMapa from '$lib/components/maps/edit/csvUpdate.svelte'
	import type { ChartConfiguration } from 'chart.js/auto'
	import ButtonClipboard from '$lib/components/ButtonClipboard.svelte'
	import StyledButton from '$lib/components/StyledButton.svelte'
	export let data: PageData
	const map = data.map
	console.log(map)
	let query: ArcgisFilter[] = []

	let newChart: {
		chart: ChartConfiguration
		sql_filter: ArcgisFilter[]
	} = {
		chart: {
			type: 'bar',
			data: {
				labels: [],
				datasets: [
					{
						label: 'Titulo do Grafico',
						data: [],
					},
				],
			},
			options: {
				responsive: false,
				plugins: {
					legend: {
						position: 'top',
					},
					title: {
						display: true,
						text: '',
					},
				},
			},
		},
		sql_filter: query,
	}

	let new_label: string
	let query_string: string
	let chart: any

	let is_exemplo_open = true

	$: mapCOnfig = {
		csv_url: map?.csv_url,
		charts: [newChart],
		fieldNames: map?.fields,
	}
</script>

<div class=" flex justify-end gap-3 mx-3">
	<Modal
		config={{
			openButtonText: 'Criar Grafico',
			title:
				'Crie um novo grafico para o mapa, usando dados do CSV',
		}}
	>
		<div class="flex gap-3 justify-between">
			<div class="flex flex-col">
				<h1 class="text-2xl">Grafico</h1>

				<div
					class="flex items-center justify-center h-[5-vh]"
				>
					{#key newChart.chart}
						<SvChart
							height={300}
							width={300}
							bind:chart
							config={newChart.chart}
						/>
					{/key}
				</div>

				<label for="chart-type"> Tipo de grafico </label>
				<select
					name="chart-type"
					id=""
					class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
					bind:value={newChart.chart.type}
				>
					<option value="bar">Barra</option>
					<option value="line">Linha</option>
					<option value="pie">Pizza</option>
					<option value="doughnut">Donut</option>
				</select>

				<label for="title-grafico">Titulo</label>
				<input
					class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
					type="text"
					bind:value={newChart.chart.data.datasets[0].label}
				/>
			</div>

			<div class="flex flex-col gap-3">
				<div class="flex justify-between">
					<h1 class="text-2xl">Filtros</h1>
					{#if !is_exemplo_open}
						<button
							on:click={() => (is_exemplo_open = true)}
						>
							Ver Exemplos
						</button>
					{/if}
				</div>

				<input
					class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
					type="text"
					placeholder="Nome do Filtro SQL Ex: 'BAIRRO'"
					bind:value={new_label}
				/>
				<input
					class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
					type="text"
					placeholder="Filtro SQL Ex: 'CAMPO_TEXTO = 'TEXTO' OR CAMPO_NUMERICO > 10"
					bind:value={query_string}
				/>
				<button
					class="group flex justify-center items-center text-center rounded-md p-2 transition ease-in-out bg-secondary text-white hover:text-black hover:bg-primary hover:shadow-md hover:shadow-primary px-5"
					on:click={() => {
						newChart.chart.data.labels?.push(new_label)
						newChart = newChart
						newChart.sql_filter.push({
							onStatisticField: `CASE WHEN ${query_string} THEN 1 ELSE 0 END`,
							outStatisticFieldName:
								'id_grafico' + '_' + query.length,
							statisticType: 'sum',
						})
						newChart.chart.data.datasets[0].data.push(
							Math.floor(Math.random() * 100),
						)
						newChart.sql_filter = newChart.sql_filter
					}}>+</button
				>

				<pre>
					{JSON.stringify(newChart.sql_filter, null, 2)}
				</pre>
			</div>
			{#if is_exemplo_open}
				<div class="flex flex-col bg-blue-50">
					<div class=" flex justify-between">
						<p class="text-2xl">Exemplos de Filtros SQL</p>
						<button
							on:click={() => (is_exemplo_open = false)}
							class="group flex justify-center items-center text-center rounded-md p-2 transition ease-in-out bg-secondary text-white hover:text-black hover:bg-primary hover:shadow-md hover:shadow-primary px-5"
						>
							Fechar Exemplos
						</button>
					</div>
					<div class="flex flex-col overflow-scroll p-2">
						<h2 class="text-xl mt-4">
							Filtros de Dados Simples
						</h2>
						<ul class="flex flex-col space-y-4">
							<li>
								<p><b>CAMPO_TEXTO</b> = 'TEXTO'</p>
								<p class="text-gray-500">
									Filtrar por campo de texto igual a 'TEXTO'
								</p>
							</li>
							<li>
								<p>
									<b>CAMPO_TEXTO</b> LIKE '%PARTE_TEXTO%'
								</p>
								<p class="text-gray-500">
									Filtrar por campo de texto que contenha
									'PARTE_TEXTO'
								</p>
							</li>
						</ul>

						<h2 class="text-xl mt-4">Filtros de Data</h2>
						<ul class="flex flex-col space-y-4">
							<li>
								<p>
									EXTRACT(MONTH FROM <b>CAMPO_DATA</b>) = 7
								</p>
								<p class="text-gray-500">
									Filtrar por registros cujo mês no campo de
									data seja julho
								</p>
							</li>
						</ul>

						<h2 class="text-xl mt-4">Múltiplos Filtros</h2>
						<ul class="flex flex-col space-y-4">
							<li>
								<p>
									<b>CAMPO_TEXTO</b> = 'TEXTO' AND
									<b>CAMPO_NUMERICO</b> > 10
								</p>
								<p class="text-gray-500">
									Juntando 2 filtros com operador lógico AND
								</p>
							</li>
							<li>
								<p>
									<b>CAMPO_TEXTO</b> = 'TEXTO' OR
									<b>CAMPO_NUMERICO</b> > 10
								</p>
								<p class="text-gray-500">
									Juntando 2 filtros com operador lógico OR
								</p>
							</li>
						</ul>
					</div>
				</div>
			{/if}
		</div>
		<div
			class="flex flex-row bg-slate-200 p-1 mt-2 rounded"
		>
			<p class="text-2xl">Campos do CSV</p>

			<ul class=" flex flex-row space-x-2 overflow-scroll">
				{#each map.fields as item, index}
					<ButtonClipboard text={item} />
				{/each}
			</ul>
		</div>
	</Modal>

	<Modal
		config={{
			openButtonText: 'Atualizar Mapa',
			title: 'Atualize o mapa com novos dados CSV',
		}}
	>
		<AtualizarMapa {map} />
	</Modal>
</div>

<Map bind:map_config={mapCOnfig} />

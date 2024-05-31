<script lang="ts">
	import type { PageData } from './$types'

	export let data: PageData
	let supabase = data.supabase
	$: ({ supabase } = data)

	import type {
		ArcgisFilter,
		ChartFiltered,
	} from '$lib/ArcGis/types'
	import SvChart from '$lib/ArcGis/SVChart.svelte'
	import { CircleX } from 'lucide-svelte'

	import AtualizarMapa from '$lib/components/maps/edit/csvUpdate.svelte'
	import type { ChartConfiguration } from 'chart.js/auto'
	import ButtonClipboard from '$lib/components/ButtonClipboard.svelte'
	import StyledButton from '$lib/components/StyledButton.svelte'
	import { createEventDispatcher, onMount } from 'svelte'
	import CSVTable from '$lib/components/CSVTable.svelte'

	import { getCasosFromMapURL } from '$lib/utils_client'
	import { goto } from '$app/navigation'

	const map = data.map
	const grafico = data.grafico

	let isCreate = false

	let isOpen = false

	let fields: string[] = map.fields

	export let chartConfig: ChartFiltered = grafico ? JSON.parse(
		grafico?.json,
	) : {
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
		sql_filter: [],
	}

	async function createNewChart() {
		const chartToSave: ChartFiltered = {
			chart: chartConfig.chart,
			sql_filter: chartConfig.sql_filter,
		}
		const { error } = await supabase
			.from('graficos')
			.insert({
				dataset_id: map.id,
				json: JSON.stringify(chartToSave),
			})

		if (error) {
			console.error(error)
			return
		}
		goto(`/maps/${map.id}`)
	}

	async function updateChart() {
		if (!grafico?.id) {
			await createNewChart()
			return
		}

		const { error } = await supabase
			.from('graficos')
			.update({ json: JSON.stringify(chartConfig) })
			.eq('id', grafico.id)

		if (error) {
			console.error(error)
			return
		}
		goto(`/maps/${map.id}`)
	}

	let newLabel = ''
	let queryString = ''

	let is_exemplo_open = false

	$: {
		console.log(isOpen)
		console.log(chartConfig)
	}

	function createQueryFromLabel(
		label: string,
		query: string,
	) {
		return {
			label: label,
			query: query,
			onStatisticField: `CASE WHEN ${query} THEN 1 ELSE 0 END`,
			outStatisticFieldName: `id_grafico_${chartConfig.sql_filter.length}`,
			statisticType: 'sum',
		}
	}

	function pushNewFilter() {
		chartConfig.chart.data.labels?.push(newLabel)
		chartConfig = chartConfig
		chartConfig.sql_filter.push(
			createQueryFromLabel(newLabel, queryString),
		)
		chartConfig.chart.data.datasets[0].data.push(
			Math.floor(Math.random() * 100),
		)
		chartConfig.sql_filter = chartConfig.sql_filter
	}
</script>

<div class=" gap-3 p-5 flex flex-col lg:flex-row">
	<div class="flex flex-col lg:w-1/3 gap-2">
		<h1 class="text-2xl">Grafico</h1>

		<div class="flex items-center justify-center h-[5-vh]">
			{#key chartConfig.chart}
				<SvChart
					height={300}
					width={300}
					config={chartConfig.chart}
				/>
			{/key}
		</div>

		<label for="chart-type"> Tipo de grafico </label>
		<select
			name="chart-type"
			id=""
			class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
			bind:value={chartConfig.chart.type}
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
			bind:value={chartConfig.chart.data.datasets[0].label}
		/>

		<button
			class="group flex justify-center items-center text-center rounded-md p-2 transition ease-in-out bg-secondary text-white hover:text-black hover:bg-primary hover:shadow-md hover:shadow-primary px-5"
			on:click={updateChart}
		>
			Criar Grafico
		</button>
	</div>

	<div class="flex flex-col gap-3 lg:w-2/3">
		<div class="flex justify-between">
			<h1 class="text-2xl">Filtros</h1>
		</div>

		<p>
			Filtros Adicionados: {chartConfig.sql_filter.length}
		</p>

		<table>
			<tr>
				<th colspan="2">Label</th>
				<th colspan="2">
					SQL

					{#if !is_exemplo_open}
						<button
							class="text-sm text-primary hover:text-secondary hover:underline"
							on:click={() => (is_exemplo_open = true)}
						>
							Ver Exemplos
						</button>
					{/if}
				</th>
			</tr>
			{#each chartConfig.sql_filter as filter}
				<tr>
					<td colspan="2">
						<input
							type="text"
							class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
							value={filter.label}
							on:change={(e) => {
								// @ts-ignore
								const value = e.target?.value ?? ''
								filter = createQueryFromLabel(
									value,
									// @ts-ignore
									filter.query,
								)
							}}
						/>
					</td>
					<td colspan="3">
						<input
							type="text"
							class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
							value={filter.query}
							on:change={(e) => {
								// @ts-ignore
								const value = e.target?.value ?? ''
								filter = createQueryFromLabel(
									// @ts-ignore
									filter.label,
									value,
								)
							}}
						/></td
					>
				</tr>
			{/each}

			<tfoot>
				<tr class="p-3">
					<td colspan="2">
						<input
							class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
							type="text"
							placeholder="Nome do Filtro SQL Ex: 'BAIRRO'"
							bind:value={newLabel}
						/>
					</td>
					<td colspan="2">
						<input
							class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
							type="text"
							placeholder="Filtro SQL Ex: 'CAMPO_TEXTO = 'TEXTO' OR CAMPO_NUMERICO > 10"
							bind:value={queryString}
						/>
					</td>
					<td class="flex justify-end w-full">
						<button
							class="group flex w-full justify-center items-center text-center rounded-md p-2 transition ease-in-out bg-secondary text-white hover:text-black hover:bg-primary hover:shadow-md hover:shadow-primary px-5"
							on:click={pushNewFilter}
						>
							+
						</button>
					</td>
				</tr>
			</tfoot>
			
		</table>

		<!-- 				
        <pre>
            {JSON.stringify(newChart.sql_filter, null, 2)}
        </pre> -->
	</div>
</div>

<div class="m-1 mt-3">
	<CSVTable
		csv_url={map.csv_url}
		on:select={(e) => {
			const value = e.detail
			navigator.clipboard.writeText(value)
		}}
		on:field_select={(e) => {
			const value = e.detail
			navigator.clipboard.writeText(value)
		}}
	/>
</div>

{#if is_exemplo_open}
	<div
		class="flex flex-row bg-gray-200 p-2 mt-2 rounded-lg"
	>
		<div
			class="flex flex-col w-full bg-gray-200 p-3 rounded-lg"
		>
			<div class="flex justify-between">
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
						<p><b>CAMPO_TEXTO</b> LIKE '%PARTE_TEXTO%'</p>
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
	</div>
{/if}

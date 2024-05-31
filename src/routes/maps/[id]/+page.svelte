<script lang="ts">
	import type { PageData } from './$types'
	import Map from '$lib/ArcGis/ChartMap.svelte'
	import Modal from '$lib/components/Modal.svelte'
	import type {
		ArcgisFilter,
		ChartFiltered,
		MapWrapperParams,
	} from '$lib/ArcGis/types'
	import SvChart from '$lib/ArcGis/SVChart.svelte'
	import { CircleX } from 'lucide-svelte'

	import AtualizarMapa from '$lib/components/maps/edit/csvUpdate.svelte'
	import type { ChartConfiguration } from 'chart.js/auto'
	import ButtonClipboard from '$lib/components/ButtonClipboard.svelte'
	import StyledButton from '$lib/components/StyledButton.svelte'
	import { onMount } from 'svelte'

	import { getCasosFromMapURL } from '$lib/utils_client'
	import ModalEditGrafico from '$lib/ModalEditGrafico.svelte'
	import { goto } from '$app/navigation'
	export let data: PageData

	let { supabase } = data
	$: ({ supabase } = data)

	const map = data.map
	console.log(map)

	let mapConfig: MapWrapperParams = {
		csv_url: map?.csv_url,
		center: [
			map?.long ?? -55.491977,
			map?.lat ?? -10.836584,
		],
		charts:
			map.graficos.map((g) => {
				return {
					id:g.id,
					...JSON.parse(g.json),
				}
			}) ?? [],
		fieldNames: map?.fields,
	}

	let casos: number | null = null

	onMount(async () => {
		casos = await getCasosFromMapURL(map.csv_url)
	})

	$: console.log(mapConfig)

	async function pushNewChart(newChart: ChartFiltered) {
		console.log('pushing new chart', newChart)
		mapConfig.charts.push({
			id: Math.random().toString(),
			...newChart,
		})
		mapConfig = mapConfig
	}

	async function deleteChart(chart: ChartFiltered) {
		console.log('deleting chart', chart)
		mapConfig.charts = mapConfig.charts.filter(
			(c) => c.id !== chart.id,
		)
		mapConfig = mapConfig
	}
</script>

<div class=" flex justify-between gap-3 mx-2 my-2">
	{#if casos}
		<div class="flex flex-col items-center">
			<p class="text-xl">
				Total de casos: <span
					class="rounded bg-secondary text-white px-1"
				>
					{casos}
				</span>
			</p>
		</div>
	{/if}

	{#if !casos}
		<div class="flex flex-col gap-3">
			<p class="text-2xl">Carregando dados...</p>
		</div>
	{/if}

	<div class="flex flex-col sm:flex-row gap-2">
		<!-- <ModalEditGrafico
			on:createChart={(e) => {
				const newGrafico = e.detail
				pushNewChart(newGrafico)
			}}
			fields={map.fields}
			isCreate={true}
		/> -->

		<a
			href="/maps/{map.id}/grafico"
			class="group flex justify-center items-center text-center rounded-md p-2 transition ease-in-out bg-secondary text-white hover:text-black hover:bg-primary hover:shadow-md hover:shadow-primary px-3"
		>
			Criar Grafico
		</a>

		<Modal
			config={{
				openButtonText: 'Atualizar Mapa',
				title: 'Atualize o mapa com novos dados CSV',
			}}
		>
			<AtualizarMapa {map} />
		</Modal>
	</div>
</div>

<Map
	bind:map_config={mapConfig}
	on:deleteChart={(e) => {
		const chartEventValue = e.detail
		deleteChart(chartEventValue.chart)
	}}
	on:edit={(e) => {
		const chart = e.detail.chart
		goto(`/maps/${map.id}/grafico/${chart.id}`)
	}}
/>

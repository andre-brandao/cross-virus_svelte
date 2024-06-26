<script lang="ts">
	import type {
		Chart,
		ChartConfiguration,
	} from 'chart.js/auto'
	import type MapView from '@arcgis/core/views/MapView'
	import Widget from '@arcgis/core/widgets/Widget'

	//  COMOPONENTS
	import MapDrag from './CSV/Map.svelte'
	import SvChart from './SVChart.svelte'
	//   TYPES

	import type {
		DragSearchMapParams,
		MapWrapperParams,
		ArcgisFilter,
		ChartFiltered,
		LayerFilter,
	} from './types.ts'
	import ModalEditGrafico from '$lib/ModalEditGrafico.svelte'
	import { CircleX, PenLine } from 'lucide-svelte'
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

	export let map_config: MapWrapperParams

	$: formated_mapConfig = {
		csv_url: map_config.csv_url,
		fieldNames:
			map_config.options?.drag_filter?.fieldNames ?? [],
		center: map_config.center,
		options: {
			drag_filter: {
				// radius: map_config.options?.drag_filter?.radius ?? 1,
				sql_filter: map_config.charts
					.map((chart) => chart.sql_filter)
					.reduce((acc, val) => acc.concat(val), []),
				where: map_config.options?.drag_filter?.where,
			},
			layer_filter: map_config.options?.layer_filter,
		},
	}

	$: chartConfigs = map_config.charts

	let chartsRef: Chart[] = []

	function updateChart(chart: Chart, dataValues: any[]) {
		// console.log("updating chart", chart, dataValues);

		try {
			if (
				chart.config.data.datasets.length > 1 &&
				dataValues.length > 1 &&
				map_config.options?.drag_filter?.where
			) {
				const query_data = dataValues[0]
				const where_data = dataValues[1]
				// console.log(query_data, where_data);

				const first_value = dataValues[0].map(
					(_, i) => query_data[i] - where_data[i],
				)
				chart.config.data.datasets[0].data = first_value
				chart.config.data.datasets[1].data = dataValues[1]
				// console.log(first_value, dataValues[1]);
			} else {
				chart.config.data.datasets[0].data = dataValues[0]
			}
			// chart.config.data.datasets[0].data = dataValues;
			chart.update()
		} catch (error) {
			console.error('Error updating chart', error)
		}
	}

	function handleQueryResults(e: CustomEvent<any>) {
		const results = e.detail
		console.log('query results:', results)

		chartConfigs.forEach((chart_config, i) => {
			// console.log(chart);

			let data: any[] =
				chart_config.chart.data.datasets.map(
					(dataset, i) => {
						if (results[i] === undefined) {
							return []
						}
						return chart_config.sql_filter.map(
							(filter) =>
								results[i][filter.outStatisticFieldName],
						)
					},
				)

			// console.log("updating chart", chartsRef[i], data);

			updateChart(chartsRef[i], data)
		})
	}

	$: {
		console.log('formated_mapCOnfig', formated_mapConfig)
		console.log('mapConfig', map_config)
	}
</script>

<main class="flex flex-col lg:flex-row mb-40 md:mb-0">
	<div class="lg:w-2/3 w-full">
		<MapDrag
			bind:map_config={formated_mapConfig}
			on:query_results={handleQueryResults}
		/>
	</div>

	<div
		class="lg:w-1/3 w-full flex flex-wrap justify-center items-center md:overflow-scroll h-[85vh] gap-20"
	>
		{#each chartConfigs as chart, i}
			{@const config = chart.chart}
			{@const width = chart.size?.width ?? 350}
			{@const height = chart.size?.height ?? 350}

			<div class="relative">
				<button
					on:click={() => {
						if (
							confirm(
								'Are you sure you want to delete this chart?',
							)
						) {
							dispatch('deleteChart', {
								index: i,
								chart: chart,
							})
						}
					}}
					class="rounded-full transition ease-in-out hover:bg-gray-300 p-1 m-1"
				>
					<CircleX color="#C00000" />
				</button>

				<button
					on:click={() => {
						dispatch('edit', {
							index: i,
							chart: chart,
						})
					}}
					class="rounded-full transition ease-in-out hover:bg-gray-300 p-1 m-1"
				>
					<PenLine />
				</button>
				<SvChart
					bind:chart={chartsRef[i]}
					{config}
					{width}
					{height}
				/>
			</div>
		{/each}
	</div>
</main>

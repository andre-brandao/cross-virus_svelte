import { writable } from 'svelte/store'

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
import { onMount } from 'svelte'

import { getCasosFromMapURL } from '$lib/utils_client'

let grafico: {
	chart: ChartConfiguration
	sql_filter: ArcgisFilter[]
}

export let graficoStore = writable<{
	chart: ChartConfiguration
	sql_filter: ArcgisFilter[]
}>({
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
})

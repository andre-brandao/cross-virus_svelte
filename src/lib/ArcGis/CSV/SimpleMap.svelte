<script lang="ts">
	// import '@arcgis/core/assets/esri/themes/light/main.css'
	import MapView from '@arcgis/core/views/MapView'

	import Map from '@arcgis/core/Map'

	import CSVLayer from '@arcgis/core/layers/CSVLayer'

	import type { Action } from 'svelte/action'

	// INIT ----------------------------------------
	const csv_map: Action<HTMLDivElement, undefined> = (
		node,
	) => {
		const map = new Map({ basemap: 'streets-vector' })
		const csvLayer = new CSVLayer({
			url: 'https://ggueyaykipybplpopegl.supabase.co/storage/v1/object/public/csv_maps/3100401/teste_api',
		})

		map.add(csvLayer)

		const view = new MapView({
			container: node,
			map: map,
			zoom: 4,
			// brazil
			center: [-55.491977, -10.836584],
			highlightOptions: {
				// @ts-expect-error green is a valid color
				color: 'green',
				haloOpacity: 0.65,
				fillOpacity: 0.45,
			},
		})
	}
</script>

<div class="h-screen w-screen">
	<div class="h-screen w-screen" use:csv_map></div>
</div>

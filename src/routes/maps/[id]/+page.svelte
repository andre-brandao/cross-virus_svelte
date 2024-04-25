<script lang="ts">
	import type { PageData } from './$types'
	import Map from '$lib/ArcGis/CSV/Map.svelte'

	export let data: PageData
</script>

<Map
	map_config={{
		csv_url: data.map.csv_url,
	}}
/>

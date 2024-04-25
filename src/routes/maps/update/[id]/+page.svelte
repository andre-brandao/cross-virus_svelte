<script lang="ts">
	import CsvUptade from '$lib/components/maps/edit/csvUpdate.svelte'
	import type { PageData } from './$types'

	export let data: PageData

	const map = data.map
</script>

<CsvUptade {map} />

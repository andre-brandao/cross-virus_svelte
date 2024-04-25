<script lang="ts">
	import type { PageData } from './$types'
	import CsvUpdate from '$lib/components/maps/edit/csvUpdate.svelte'

	export let data: PageData

	const map = data.map
</script>

<CsvUpdate {map} />

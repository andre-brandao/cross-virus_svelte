<script lang="ts">
	import CsvCreate from '$lib/components/maps/edit/csvCreate.svelte';
	import type { PageData } from './$types'

	export let data: PageData
	const municipio = data.municipio
</script>

<CsvCreate {municipio} />

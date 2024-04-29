<script lang="ts">
	import type { PageData } from './$types'

	export let data: PageData
	const municipio = data.municipio
	console.log(municipio)
</script>

<main class="flex justify-center items-center h-screen">
	<h1>Bem vindo a central crossvirus de {municipio?.nome} - {municipio?.UF}</h1>
</main>

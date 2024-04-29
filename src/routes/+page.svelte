<script lang="ts">
	import type { PageData } from './$types'

	export let data: PageData
	const municipio = data.municipio
	console.log(municipio)
</script>

<main class="flex justify-center items-center md:h-[90vh] bg-gray-100">
    <div class="text-center">
        <h1 class="text-3xl font-bold mb-4">Bem-vindo à Central Crossvirus de <span class="text-primary">{municipio?.nome} - {municipio?.UF}</span></h1>
        <p class="text-lg text-gray-600">Mantenha-se seguro e informado sobre as últimas atualizações.</p>
    </div>
</main>
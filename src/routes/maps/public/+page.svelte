<script lang="ts">
	import type { PageData } from './$types'

	export let data: PageData
</script>

<div
	class="flex flex-col items-center justify-center w-full"
>
	<h1>
		Conheça os mapas públicos disponíveis, caso tenha
		interesse em criar um mapa especial para seu município, <a
			class="text-secondary underline hover:bg-primary p-1 rounded-md"
			href="https://wa.me/5531983861852?text={encodeURIComponent(
				'Gostaria de criar um mapa personalizado com diversar camadas!',
			)}">entre em contato</a
		>
		com a equipe crossvirus.
	</h1>
	<!-- svelte-ignore a11y-missing-attribute -->
	<iframe
		class="w-full h-[70vh] my-4"
		src="https://www.crossvirus.com.br/maps/embed"
		frameborder="0"
	></iframe>
</div>

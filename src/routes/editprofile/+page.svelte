<script lang="ts">
	import type { PageData } from './$types'

	export let data: PageData
	let info = data.info
	let { supabase } = data
	$: ({ supabase } = data)

	let nome: string = info.nome ?? ''
	let raio: number = info.raio_alerta ?? 0

	let municipios = data.municipio

	let erros = ''

	async function updateUser() {
		const { error } = await supabase
			.from('info_user')
			.update({
				nome: nome,
				raio_alerta: raio,
			})
			.eq('auth_id', info.auth_id)
		console.log(error)
	}
</script>

<section class="bg-gray-50">
	<div
		class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-[90vh] lg:py-0"
	>
		<a
			href="/"
			class="flex items-center mb-6 text-2xl font-semibold text-gray-900"
		>
			Crossvirus - Editar dados pessoais
		</a>
		<div
			class="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0"
		>
			<div class="p-6 space-y-4 md:space-y-6 sm:p-8">
				<h1
					class="text-xl font-bold leading-tight tracking-tight text-center text-gray-900 md:text-2xl"
				>
					{municipios?.nome} - {municipios?.UF} ({municipios?.CodMun})
				</h1>
				<p class="text-center">{info.email}</p>
				<div class="text-center flex flex-col">
					<p>Geopoints utilzados:</p>

					<code class=" rounded p-1 bg-gray-100">
						{info.geopoints_utilizados} /
						{info.limite_geopoints}
					</code>
					<!-- Preciso de mais geopoints no crossvirus -->
					<a
						href="https://wa.me/5531983861852?text={encodeURIComponent(
							'Preciso de comprar mais geopoints no crossvirus',
						)}"
						class="hover:underline bg-primary text-secondary hover:bg-secondary hover:text-primary p-3 mt-2"
					>
						Comprar mais geopoints
					</a>
				</div>

				<form class="space-y-4 md:space-y-6" method="post">
					<div>
						<label
							for="email"
							class="block mb-2 text-sm font-medium text-gray-900"
							>Seu nome:</label
						>
						<input
							type="name"
							name="name"
							id="name"
							class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
							placeholder={nome}
							bind:value={nome}
						/>
					</div>
					<p
						class="text-sm font-medium text-red-500"
						hidden={!erros}
					>
						{erros}
					</p>
					<div>
						<label
							for="password"
							class="block mb-2 text-sm font-medium text-gray-900"
							>Raio da notificação de novos casos (metros)</label
						>
						<input
							type="number"
							name="range"
							id="range"
							min="0"
							placeholder="0"
							class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
							bind:value={raio}
						/>
						<p class="mt-3 text-xs">
							Quando forem computados novos casos de uma
							doença o crossvirus te enviara um email
							avisando
						</p>
					</div>
					<button
						type="button"
						class="w-full text-white bg-secondary hover:bg-primary focus:ring-4 focus:outline-none focus:ring-primary font-medium rounded-lg text-sm px-5 py-2.5 text-center"
						on:click={updateUser}
						>Atualizar informacões pessoais</button
					>
					<p class="text-sm font-light text-gray-500">
						Tudo Certo? Volte para <a
							href="/"
							class="font-medium text-primary hover:underline"
							>Dashboard</a
						>
						?
					</p>
				</form>
			</div>
		</div>
	</div>
</section>

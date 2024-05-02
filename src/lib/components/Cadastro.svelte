<script lang="ts">
	import type { SupabaseClient } from '@supabase/supabase-js'
	import type { Database } from '$lib/supabase-types'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let supabase: SupabaseClient<Database>

	let email: string
	let password: string

	let municipio: number

	let municipios: {
		nome: string
		CodMun: number
	}[] = []

	let erros = ''

	async function SignUp() {
		const { data: exists } = await supabase
			.from('info_user')
			.select('*, municipios(*)')
			.eq('email', email)
			.single()

		if (exists) {
			console.log(exists)

			const muni =
				exists.municipios?.nome +
				' - ' +
				exists.municipios?.UF
			erros = 'Email já cadastrado em ' + muni
			return
		}

		if (!municipio) {
			erros = 'Selecione um município'
			return
		}

		console.log('signing up', email, municipio)

		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					municipio: municipio,
				},
			},
		})
		if (error) {
			console.error(error)
			erros = error.message
			return
		}
		window.location.reload()
	}

	async function getMunicipios(
		e: Event & {
			currentTarget: EventTarget & HTMLSelectElement
		},
	) {
		const uf = e.currentTarget.value
		console.log('loading municipios for', uf)

		const { data, error } = await supabase
			.from('municipios')
			.select('nome, CodMun')
			.eq('UF', uf)
		if (error) {
			console.error(error)
			return
		}
		municipios = data
	}

	let estados: string[] = [
		'MG',
		'SP',
		'RJ',
		'ES',
		'BA',
		'RS',
		'SC',
		'PR',
		'GO',
		'DF',
		'MS',
		'MT',
		'RO',
		'AC',
		'AM',
		'RR',
		'PA',
		'AP',
		'TO',
		'MA',
		'PI',
		'CE',
		'RN',
		'PB',
		'PE',
		'AL',
		'SE',
	]
</script>

<section class="bg-gray-50">
	<div
		class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-[90vh] lg:py-0"
	>
		<a
			href="/"
			class="flex items-center mb-6 text-2xl font-semibold text-gray-900"
		>
			Crossvirus
		</a>
		<div
			class="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0"
		>
			<div class="p-6 space-y-4 md:space-y-6 sm:p-8">
				<h1
					class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl"
				>
					Dados para cadastro
				</h1>
				<form class="space-y-4 md:space-y-6">
					<div>
						<label
							for="estado"
							class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
						>
							Estado
						</label>
						<select
							name="estado"
							id="estado"
							on:change={getMunicipios}
							class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
						>
							<option value="">Selecione o Estado</option>
							{#each estados as estado}
								<option value={estado}>{estado}</option>
							{/each}
						</select>
					</div>

					<div>
						<label
							for="municipio"
							class="block mb-2 text-sm font-medium text-gray-900"
						>
							Município
						</label>
						<select
							bind:value={municipio}
							disabled={municipios.length === 0}
							name="municipio"
							id="municipio"
							required
							class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
						>
							{#each municipios ?? [] as municipio}
								<option value={municipio.CodMun}
									>{municipio.nome}</option
								>
							{/each}
						</select>
					</div>

					<div>
						<label
							for="email"
							class="block mb-2 text-sm font-medium text-gray-900"
							>Seu email:</label
						>
						<input
							type="email"
							name="email"
							bind:value={email}
							id="email"
							class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
							placeholder="nome@company.com"
						/>
					</div>

					<div>
						<label
							for="password"
							class="block mb-2 text-sm font-medium text-gray-900"
							>Senha</label
						>
						<input
							type="password"
							name="password"
							id="password"
							bind:value={password}
							placeholder="********"
							class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
						/>
					</div>

					<div>
						<p
							class="text-sm font-medium text-red-500"
							hidden={!erros}
						>
							{erros}
						</p>
					</div>

					<div>
						<button
							on:click={SignUp}
							class="w-full text-white bg-secondary hover:bg-primary focus:ring-4 focus:outline-none focus:ring-primary font-medium rounded-lg text-sm px-5 py-2.5 text-center"
							>Cadastrar</button
						>
						<p class="text-sm font-light text-gray-500">
							Já possui uma conta? Faça <button
								on:click={() => dispatch('login')}
								class="font-medium text-primary hover:underline"
								>Login!</button
							>
						</p>
					</div>
				</form>
			</div>
		</div>
	</div>
</section>

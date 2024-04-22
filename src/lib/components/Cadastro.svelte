<script lang="ts">
	import type { SupabaseClient } from '@supabase/supabase-js'
	import type { Database } from '$lib/supabase-types'

	export let supabase: SupabaseClient

	let email: string
	let password: string

	let municipio: string

	let erros = ''

	async function SignUp() {
		const exists = await supabase
			.from('info_user')
			.select('*, municipios(*)')
			.eq('email', email)
			.single()

		if (exists.data) {
			const muni =
				exists.data.municipios?.nome + ' - ' + exists.data.municipios?.UF
			erros = 'Email já cadastrado em ' + muni
			return
		}

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
		<div class="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
			<div class="p-6 space-y-4 md:space-y-6 sm:p-8">
				<h1
					class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl"
				>
					Dados para cadastro
				</h1>
				<form class="space-y-4 md:space-y-6" method="post">
					<!-- <SelectMunicipio client:only />
              {
                erros.municipio && (
                  <p class="text-sm text-red-500 ">
                    {erros.municipio}
                  </p>
                )
              } -->
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
					<!-- {
                erros.email && (
                  <p class="text-sm text-red-500">
                    {erros.email}
                  </p>
                )
              } -->
					<div>
						<label
							for="password"
							class="block mb-2 text-sm font-medium text-gray-900">Senha</label
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
					<!-- {
                erros.password && (
                  <p class="text-sm text-red-500">
                    {erros.password}
                  </p>
                )
              } -->

					<div>
						<button
							on:click={SignUp}
							type="submit"
							class="w-full text-white bg-secondary hover:bg-primary focus:ring-4 focus:outline-none focus:ring-primary font-medium rounded-lg text-sm px-5 py-2.5 text-center"
							>Cadastrar</button
						>
						<p class="text-sm font-light text-gray-500">
							Já possui uma conta? Faça <a
								href="/login"
								class="font-medium text-primary hover:underline">Login!</a
							>
						</p>
					</div>
				</form>
			</div>
		</div>
	</div>
</section>

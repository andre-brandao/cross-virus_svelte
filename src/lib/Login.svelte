<script lang="ts">
	import type { SupabaseClient } from '@supabase/supabase-js'
	import { sineIn } from 'svelte/easing'
	import type { Database } from './supabase-types'

	export let supabase: SupabaseClient<Database>

	let action_type: 'login' | 'register' = 'login'

	let email: string
	let password: string

	let municipio: string

	let erros = ''

	async function signIn() {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		})
		if (error) {
			console.error(error)
			erros = error.message
			return
		}
		window.location.reload()
	}

	async function SignUp() {
		const exists = await supabase
			.from('info_user')
			.select('*, municipios(*)')
			.eq('email', email)
			.single()

		if (exists.data) {
			const muni = exists.data.municipios?.nome + ' - ' + exists.data.municipios?.UF
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

<div class="flex justify-center items-center md:h-screen">
	<div class="flex flex-col gap-2">
		{#if action_type === 'login'}
			<h1>Login CrossVirus</h1>
			<label for="email">Email</label>
			<input
				class="bg-slate-300"
				name="email"
				type="email"
				bind:value={email}
			/>
			<label for="password">Senha</label>
			<input
				class="bg-slate-300"
				name="password"
				type="password"
				bind:value={password}
			/>
			<p class="bg-red-300" hidden={!erros}>
				{erros}
			</p>
			<button class="w-full bg-slate-400 hover:bg-slate-50" on:click={signIn}>
				Login
			</button>
		{:else}
			<h1>Registro CrossVirus</h1>
			<label for="email">Email</label>
			<input
				class="bg-slate-300"
				name="email"
				type="email"
				bind:value={email}
			/>
			<label for="password">Senha</label>
			<input
				class="bg-slate-300"
				name="password"
				type="password"
				bind:value={password}
			/>
			<p class="bg-red-300" hidden={!erros}>
				{erros}
			</p>
			<button class="w-full bg-slate-400 hover:bg-slate-50" on:click={SignUp}>
				Registrar
			</button>
		{/if}

		{#if action_type === 'login'}
			<button
				class="w-full bg-slate-400 hover:bg-slate-50"
				on:click={() => (action_type = 'register')}
			>
				Registrar
			</button>
		{:else}
			<button
				class="w-full bg-slate-400 hover:bg-slate-50"
				on:click={() => (action_type = 'login')}
			>
				Login
			</button>
		{/if}
	</div>
</div>

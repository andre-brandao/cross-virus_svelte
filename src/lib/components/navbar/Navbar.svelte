<script lang="ts">
	import { Settings, Home } from 'lucide-svelte'
	import type { LayoutData } from '../../../routes/$types'
	export let data: LayoutData
	let { supabase } = data
	$: ({ supabase } = data)

	const user = data.session?.user

	const municipio = data.municipio

	async function signOut() {
		// await supabase.auth.signInWithPassword({
		// 	email: 'andre@3geolink.com.br',
		// 	password: 'Andre540',
		// })
		await supabase.auth.signOut()
	}
</script>

<nav
	class="flex max-md:flex-col gap-2 justify-between p-2 m-2 bg-white rounded"
>
	<div class="flex max-md:flex-col gap-2">
		<a href="/" class="hover:bg-slate-400 rounded-full">
			<Home />
		</a>
		<p class="bg-slate-600 text-white px-1 rounded">
			Central Crossvirus {municipio?.nome}
		</p>
		<a
			class=" hover:bg-primary border border-primary rounded p-1 px-3"
			href="https://crossvirus.com.br">Home Page</a
		>

		<a class=" hover:bg-slate-100 bg-slate-400 rounded px-1" href="/maps"
			>Mapas</a
		>
	</div>

	<div>
		<button
			class="flex gap-1 hover:underline hover:bg-slate-100 bg-slate-400 rounded px-1"
			on:click={signOut}
			>{user?.email}
			<Settings />
		</button>
	</div>
</nav>

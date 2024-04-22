<script lang="ts">
	import Login from '$lib/LoginPage.svelte'
	import '../app.css'
	import Navbar from '$lib/components/navbar/Navbar.svelte'

	import type { LayoutData } from './$types'
	export let data: LayoutData
	let { supabase } = data
	$: ({ supabase } = data)

	const user = data.session?.user
</script>

{#if !user}
	<Login {supabase} />
{:else}
	<main>
		<Navbar {data} />
		<slot>Empty layout</slot>
	</main>
{/if}

<script lang="ts">
	import type { SupabaseClient } from '@supabase/supabase-js'
	import Cadastro  from '$lib/components/Cadastro.svelte'
	import Login from '$lib/components/Login.svelte'
	export let supabase: SupabaseClient

	let action_type: 'login' | 'register' = 'login'
</script>

{#if action_type === 'login'}
	<Login {supabase} />
{:else}
	<Cadastro {supabase} />
{/if}

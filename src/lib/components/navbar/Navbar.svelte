<script lang="ts">
	import {
		Settings,
		Home,
		Map,
		AlignJustify,
		LogOut,
	} from 'lucide-svelte'
	import type { LayoutData } from '../../../routes/$types'
	import type { ComponentType } from 'svelte'
	import type { Icon } from 'lucide-svelte'
	import NavButton from './NavButton.svelte'

	export let data: LayoutData
	let { supabase } = data
	$: ({ supabase } = data)

	let itens: {
		label: string
		href: string
		icon: ComponentType<Icon>
	}[] = [
		{
			label: 'Início',
			href: '/',
			icon: AlignJustify,
		},
		{
			label: 'Home Page',
			href: 'https://crossvirus.com.br',
			icon: Home,
		},
		{ label: 'Mapas', href: '/maps', icon: Map },
	]

	const user = data.session?.user

	const municipio = data.municipio

	async function signOut() {
		console.log('singOut')

		const { error } = await supabase.auth.signOut()

		if (error) {
			console.error(error)
			return
		}
		window.location.reload()
	}
</script>

<nav
	class="sticky top-1 flex max-md:flex-col gap-2 justify-between p-2 m-2 bg-white rounded"
>
	<div class="flex max-md:flex-col gap-2">
		{#if itens.length > 0}
			<NavButton
				href={itens[0].href}
				label={itens[0].label}
				Icon={itens[0].icon}
			/>
		{/if}

		<p class="p-2 px-4 rounded self-center bg-gray-200">
			Central Crossvirus de <span
				class="text-secondary font-bold"
				>{municipio?.nome}</span
			>
		</p>

		{#each itens.slice(1) as item}
			<NavButton
				href={item.href}
				label={item.label}
				Icon={item.icon}
			/>
		{/each}
	</div>

	<div class="flex gap-2">
		<NavButton
			href="/editprofile"
			label="Editar perfil"
			Icon={Settings}
		/>

		<button on:click={signOut}>
			<NavButton label={user?.email} Icon={LogOut} />
		</button>
	</div>
</nav>

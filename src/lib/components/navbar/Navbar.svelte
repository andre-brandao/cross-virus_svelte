<script lang="ts">
	import {
		Settings,
		Home,
		Map,
		AlignJustify,
		LogOut,
		MapPinned,
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
			label: 'Home',
			href: 'https://crossvirus.com.br',
			icon: Home,
		},
		{ label: 'Mapas', href: '/maps', icon: Map },
		{
			label: 'Mapas públicos',
			href: 'https://crossvirus.com.br/maps',
			icon: MapPinned,
		},
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

<nav class="bg-white p-2 m-2">
	<div class=" flex flex-wrap items-center justify-between">
		<div
			class=" max-xl:flex-col hidden w-full xl:block xl:w-auto"
			id="navbar-default"
		>
			<div class="flex gap-2">
				{#if itens.length > 0}
					<NavButton
						href={itens[0].href}
						label={itens[0].label}
						Icon={itens[0].icon}
					/>
				{/if}

				<p
					class="flex justify-center p-2 px-4 rounded-md items-center bg-gray-200"
				>
					Central Crossvirus de&nbsp<span
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
		</div>
		<button
			data-collapse-toggle="navbar-default"
			type="button"
			class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg xl:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
			aria-controls="navbar-default"
			aria-expanded="false"
		>
			<span class="sr-only">Open main menu</span>
			<svg
				class="w-5 h-5"
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 17 14"
			>
				<path
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M1 1h15M1 7h15M1 13h15"
				/>
			</svg>
		</button>
		<div
			class="hidden w-full xl:block xl:w-auto"
			id="navbar-default"
		>
			<ul
				class="font-medium flex flex-col p-4 xl:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 xl:flex-row xl:space-x-8 rtl:space-x-reverse xl:mt-0 xl:border-0 xl:bg-white"
			>
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
			</ul>
		</div>
	</div>
</nav>

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

	let isOpen = false

	function toggleNavbar() {
		const navbar = document.getElementById('navbar-default')
		if (!navbar) return
		navbar.style.display = isOpen ? 'none' : 'block'
		isOpen = !isOpen
	}
</script>

<nav
	class="bg-white p-2 m-2 flex-wrap items-center justify-between"
>
	<button
		data-collapse-toggle="navbar-default"
		type="button"
		class="inline-flex items-center p-2 w-10 h-10 mb-2 justify-center text-sm text-gray-500 rounded-lg xl:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
		aria-controls="navbar-default"
		aria-expanded="false"
		on:click={toggleNavbar}
	>
		{#if isOpen}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18L18 6M6 6l12 12"
				/>
			</svg>
		{:else}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 6h16M4 12h16m-7 6h7"
				/>
			</svg>
		{/if}
	</button>
	<div
		id="navbar-default"
		class="max-xl:flex-col hidden w-full xl:block xl:w-auto"
	>
		<div class="flex justify-between lg:flex-row flex-col">
			<div>
				<div class="flex flex-col lg:flex-row gap-2">
					{#each itens as item}
						<NavButton
							href={item.href}
							label={item.label}
							Icon={item.icon}
						/>
					{/each}
					<p
						class="flex justify-center p-2 rounded-md items-center"
					>
						Central Crossvirus de&nbsp<span
							class="text-secondary font-bold"
							>{municipio?.nome}</span
						>
					</p>
				</div>
			</div>
			<div>
				<div class="flex flex-col lg:flex-row gap-2">
					<NavButton
						href="/editprofile"
						label="Editar perfil"
						Icon={Settings}
					/>

					<button on:click={signOut}>
						<NavButton label={user?.email} Icon={LogOut} />
					</button>
				</div>
			</div>
		</div>
	</div>
</nav>

<script>
	//@ts-nocheck
	import { goto } from '$app/navigation'

	export let map = {
		CodMun: 4311343,
		created_at: 'string',
		created_by: 'string',
		csv_url: 'string',
		endereco: 'string',
		fields: [''],
		id: 7,
		title: 'string',
	}
	let file
	let parsedData = []
	let campo_endereco = ''

	$: nome_dataset = map.title

	let isCarregando = false
	function onFileChange(event) {
		isCarregando = true
		file = event.target.files[0]
		const reader = new FileReader()
		reader.onload = (e) => {
			parseCsv(e.target.result)
		}
		reader.readAsText(file)
	}

	let isValidCSV = false
	let geoPointsEsgotados = false
	let erros = ''

	function parseCsv(csvData) {
		const lines = csvData.split('\n')
		const headers = lines[0].split(',')
		isValidCSV = true
		erros = ''

		if (!headers.includes(map.endereco)) {
			isValidCSV = false
			erros +=
				'O arquivo não contém o campo de endereço, ou o campo de endereço não é o mesmo do dataset.'
		}

		if (erros) {
			isCarregando = false
			return
		} else {
		}

		parsedData = lines.slice(1).map((line) => {
			const columns = line.split(',')
			return headers.reduce((entry, header, index) => {
				entry[header.trim()] = columns[index]?.trim()
				return entry
			}, {})
		})
		isCarregando = false
	}

	let isUploading = false
	async function onFormSubmit() {
		console.log('Enviando arquivo...')
		isUploading = true
		if (!file) {
			isUploading = false
			console.log(
				'Arquivo ou campo de endereço não fornecido',
			)
			return
		}

		const formData = new FormData()
		formData.append('csv', file)
		formData.append('map_id', map.id)

		const response = await fetch(`/api/maps/update`, {
			method: 'POST',
			body: formData,
		})

		let result = await response.text()
		console.log(result)
		if (response.ok) {
			goto(`/maps/${map.id}`)
			console.log('Resultado da Geocodificação:', result)
			setTimeout(() => {
				window.location.reload()
			}, 3000)
		} else {
			if (response.status === 402) {
				geoPointsEsgotados = true
			}
			erros = result
			console.error(result)
		}
		isUploading = false

	}
</script>

{#if isUploading}
	<main class="flex items-center justify-center h-screen">
		<div class="p-4">
			<div class="rounded p-2 m-2 bg-gray-200">
				<p>Enviando arquivo...</p>
			</div>

			<!-- spinner -->
			<div class="flex justify-center">
				<svg
					class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle
						class="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						stroke-width="4"
					></circle>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A8.001 8.001 0 014.708 4.708L7.291 7.29zm10.582 0a8.001 8.001 0 01-2.583 2.583l2.583 2.582z"
					></path>
				</svg>
			</div>
		</div>
	</main>
{:else}
	<main
		class="flex items-center justify-center bg-gray-100"
	>
		<div class="">
			<div class="flex justify-between p-5">
				<h1 class="text-2xl font-bold">
					Update Dataset CSV
				</h1>
				<h1 class="text-2xl font-bold">
					{nome_dataset}
				</h1>
			</div>
			<form
				method="post"
				class="rounded sticky top-10 flex p-5 my-2 border shadow-lg bg-white gap-2 justify-between {!true
					? 'border-green-300'
					: 'border-secondary'}"
			>
				<input
					id="csv"
					name="csv"
					type="file"
					on:change={onFileChange}
					class="rounded py-2 px-3 text-white file:bg-transparent file:rounded file:border-0 file:text-white items-center self-center w-full {!file
						? 'bg-secondary'
						: 'border-green-300 bg-green-500'}"
				/>

				<button
					type="button"
					on:click={onFormSubmit}
					class="bg-primary disabled:bg-secondary items-center text-center rounded-md p-2 transition ease-in-out disabled:text-white text-black hover:disabled:bg-opacity-80 hover:opacity-80 w-96"
					disabled={!isValidCSV && !isCarregando}
					>Geocodificar</button
				>
			</form>
			<div class="mb-3">
				** O novo arquivo deve ter o formato
				<code class="bg-primary p-1 rounded">
					{#each map.fields as item}
						<span>
							{item} |
						</span>
					{/each}
				</code>
			</div>

			<p class="text-gray-500 mb-3">
				Atenção: Ao atualizar os dados de uma tabela, o mapa
				pode demorar alguns minutos para atualizar,
				verifique a quantidade de casos antes de atualizar.
			</p>
			{#if erros}
				<code class="bg-secondary text-white p-1 rounded">
					Erros: {erros}
				</code>
				{#if geoPointsEsgotados}
					<code class="bg-secondary text-white p-1 rounded">
						GeoPoints Esgotados
						<!-- preciso de comprar mais geopoints no crossvirus -->
						<a
							href="https://wa.me/5531983861852?text=Olá%20gostaria%20de%20comprar%20mais%20geopoints%20para%20o%20meu%20projeto%20no%20CrossVirus"
							>Clique aqui para resgatar mais</a
						>
					</code>
				{/if}
			{/if}
		</div>
	</main>
{/if}

{#if isCarregando}
	<div class="flex items-center justify-center h-full">
		<div class="p-4">
			<div class="rounded p-2 m-2 bg-gray-200">
				<p>Carregando arquivo...</p>
			</div>
			<div class="flex justify-center">
				<svg
					class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle
						class="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						stroke-width="4"
					></circle>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A8.001 8.001 0 014.708 4.708L7.291 7.29zm10.582 0a8.001 8.001 0 01-2.583 2.583l2.583 2.582z"
					></path>
				</svg>
			</div>
		</div>
	</div>
{/if}

{#if parsedData.length > 0}
	<div
		class="w-screen overflow-scroll h-[50vh] overflow-y-scroll"
	>
		<table class="w-full text-left table-auto">
			<thead class="bg-gray-200 sticky top-0">
				<tr>
					{#each Object.keys(parsedData[0]) as header}
						<th
							class="px-4 py-2 border hover:bg-blue-300 cursor-pointer"
							on:click={() => (campo_endereco = header)}
							>{header}</th
						>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each parsedData as row, i (i)}
					<tr>
						{#each Object.values(row) as value}
							<td class="px-4 py-2 border">{value}</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="text-center font-bold">
		Também é possivel clicar no campo do endereço
	</p>
{/if}

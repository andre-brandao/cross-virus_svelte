<script lang="ts">
	import { goto } from '$app/navigation'
	import CSVTable from '$lib/components/CSVTable.svelte'

	export let municipio = {
		CodMun: 0,
		created_at: '',
		nome: '',
		UF: '',
	}

	let file: File
	// $: fileUrl = URL.createObjectURL(file) ?? ''
	let fileUrl = ''
	let csvHeaders = []
	let campo_endereco = ''
	let ano = '2024'
	let doenca = 'Dengue'
	$: isformValid = file && campo_endereco && nome_dataset

	let list_doencas = [
		'Dengue',
		'COVID-19',
		'Chikungunya',
		'Zika',
		'Leishmaniose',
	]
	$: nome_dataset = `${ano} ${doenca} - ${municipio.UF} - ${municipio.nome}`

	let isCarregando = false
	function onFileChange(event) {
		isCarregando = true
		file = event.target.files[0]
		const reader = new FileReader()
		reader.onload = (e) => {
			const result = e.target.result
			fileUrl = URL.createObjectURL(file)
			isCarregando = false
		}
		reader.readAsText(file)
	}

	let isUploading = false

	let erros = ''
	async function subbmitForm() {
		isUploading = true
		if (!file || !campo_endereco || !nome_dataset) {
			isUploading = false
			console.log(
				'Arquivo ou campo de endereço não fornecido',
			)
			return
		}

		const formData = new FormData()
		formData.append('csv', file)
		formData.append('campo_end', campo_endereco)
		formData.append('ano', ano)
		formData.append('doenca', doenca)

		const response = await fetch('/api/maps/create', {
			method: 'POST',
			body: formData,
		})
		let result = await response.text()
		console.log(result)
		if (response.ok) {
			console.log('Resultado da Geocodificação:', result)
			goto(`/maps`)
		} else {
			erros = result
			console.error(result)
		}
		isUploading = false

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
		class="flex items-center justify-center bg-gray-100 md:h-[43vh]"
	>
		<div class="">
			<div class="flex justify-between p-5">
				<h1 class="text-2xl font-bold">
					Criando Dataset CSV
				</h1>
				<h1 class="text-2xl font-bold">
					{nome_dataset}
				</h1>
			</div>
			<form
				class="rounded sticky top-10 flex flex-col p-5 m-2 border shadow-lg bg-white {isformValid
					? 'border-green-300'
					: 'border-secondary'}"
			>
				<div>
					<input
						id="csv"
						name="csv"
						type="file"
						on:change={onFileChange}
						class="rounded py-1 px-3 text-white file:bg-transparent file:rounded file:border-0 file:text-white file:px-3 {!file
							? 'bg-secondary'
							: 'border-green-300 bg-green-500'}"
					/>
					<label for="ano"> Ano: </label>
					<select
						name="ano"
						id="ano"
						bind:value={ano}
						class="border-2 rounded py-1 px-3"
					>
						<option value="2024"> 2024 </option>
						<option value="2023">2023</option>
						<option value="2022">2022</option>
						<option value="2021">2021</option>
						<option value="2020">2020</option>
						<option value="2019">2019</option>
						<option value="2018">2018</option>
						<option value="2017">2017</option>
						<option value="2016">2016</option>
					</select>
					<label for="doenca"> Doença: </label>
					<select
						name="doenca"
						id="doenca"
						bind:value={doenca}
						class="border-2 rounded py-1 px-3"
					>
						{#each list_doencas as d}
							<option value={d}>{d}</option>
						{/each}
					</select>
				</div>

				<!--           
            <label for="field">Campo Endereço</label>
            <input
              id="field"
              name="field"
              type="text"
              bind:value={campo_endereco}
              required
              readonly
            /> -->
				<div
					class="border p-2 my-4 rounded {!campo_endereco
						? 'border-secondary'
						: ' border-green-400'}"
				>
					{#if csvHeaders.length > 0}
						<label for="field">Campo Endereço</label>
						<select
							class="rounded py-1 px-3 text-black"
							name="field"
							id="field"
							bind:value={campo_endereco}
							required
						>
							{#each csvHeaders ?? [] as header}
								<option value={header}>{header}</option>
							{/each}
						</select>
					{:else}
						<p class="p-0 m-0">
							Carregue um arquivo para selecionar o campo de
							endereço
						</p>
					{/if}
				</div>
				<button
					on:click={subbmitForm}
					class="bg-primary w-full disabled:bg-secondary items-center text-center rounded-md p-2 transition ease-in-out disabled:text-white text-black hover:disabled:bg-opacity-80 hover:opacity-80"
					disabled={!isformValid}>Geocodificar</button
				>
			</form>

			<p class="text-gray-500 mb-3">
				Atenção: Recomendamos formatar o arquivo CSV sem
				caracteres especiais e sem espaços nos nomes das
				colunas. Para melhor compatibilidade com o sistema.
			</p>

			{#if erros}
				<code class="bg-secondary text-white p-1 rounded">
					{erros}
				</code>
			{/if}
		</div>
	</main>
{/if}

{#if fileUrl}
	<CSVTable
		csv_url={fileUrl}
		on:select={(e) => {
			const value = e.detail
			campo_endereco = value
		}}
		on:headers={(e) => {
			csvHeaders = e.detail
		}}
	/>
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

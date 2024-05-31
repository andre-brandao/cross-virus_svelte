<script>
	// @ts-nocheck
	import { createEventDispatcher, onMount } from 'svelte'
	import Papa from 'papaparse'
	const dispatch = createEventDispatcher()

	export let csv_url

	let data = []
	let headers = []

	$: dispatch('data', data)
	$: dispatch('headers', headers)

	onMount(async () => {
		if (csv_url) {
			try {
				const response = await fetch(csv_url)
				const csvText = await response.text()
				parseCSV(csvText)
			} catch (error) {
				console.error('Error fetching the CSV:', error)
			}
		}
	})

	function parseCSV(csvText) {
		Papa.parse(csvText, {
			header: true,
			dynamicTyping: true,
			complete: function (results) {
				headers = results.meta.fields
				data = results.data
			},
			error: function (error) {
				console.error('Error parsing the CSV:', error)
			},
		})
	}
</script>

<div class="table-container">
	{#if data.length > 0}
		<table class="min-w-full">
			<thead class="bg-gray-200">
				<tr>
					{#each headers as header}
						<th
							class="px-4 py-2 border bg-gray-400 hover:bg-gray-300 cursor-pointer"
							on:click={() => dispatch('select', header)}
						>
							{header}
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each data as row}
					<tr class="hover:bg-gray-100">
						{#each headers as header}
							<td
								class="px-4 py-2 border"
								on:click={() => {
									dispatch('field_select', row[header])
								}}>{row[header]}</td
							>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<p>Loading...</p>
	{/if}
</div>

<style>
	.table-container {
		width: 100%;
		max-height: 400px; /* Adjust this value as needed */
		overflow: auto;
	}
	th {
		position: sticky;
		top: 0;
		z-index: 1;
	}
</style>

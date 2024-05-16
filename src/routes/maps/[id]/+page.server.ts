import type { Actions, PageServerLoad } from './$types'
import { error, redirect } from '@sveltejs/kit'
export const load = (async ({ locals, params }) => {
	const supabase = locals.supabase

	const mapID = params.id

	const { data: map, error: err_csv_dataset } =
		await supabase
			.from('csv_dataset')
			.select('*')
			.eq('id', mapID)
			.single()
	if (err_csv_dataset) {
		console.error(err_csv_dataset)
		error(404, err_csv_dataset.message)
	}
	return { map }
}) satisfies PageServerLoad
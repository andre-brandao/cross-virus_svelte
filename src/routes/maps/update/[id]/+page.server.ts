import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load = (async ({
	locals: { supabase },
	params,
}) => {
	const mapID = params.id
	const { data: map, error: err } = await supabase
		.from('csv_dataset')
		.select('*')
		.eq('id', mapID)
		.single()

	if (err) {
		error(404, err.message)
	}
	return { map }
}) satisfies PageServerLoad

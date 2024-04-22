import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load = (async ({ locals: { supabase, safeGetSession } }) => {
	const { session, user } = await safeGetSession()

	const municipioId = user?.user_metadata.municipio

	const { data: maps, error: err } = await supabase
		.from('csv_dataset')
		.select('*')
		.eq('CodMun', municipioId)

	if (err) {
		error(404, err.message)
	}
	
	return {
		maps,
	}
}) satisfies PageServerLoad

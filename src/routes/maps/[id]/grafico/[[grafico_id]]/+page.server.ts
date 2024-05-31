import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load = (async ({ params, locals }) => {
	const supabase = locals.supabase

	const mapId = params.id
	const graficoId = params.grafico_id

	const { data: map, error: err_map } = await supabase
		.from('csv_dataset')
		.select('*')
		.eq('id', mapId)
		.single()

	if (err_map) {
		error(404, err_map.message)
	}

	if (graficoId) {
		const { data: grafico, error: err } = await supabase
			.from('graficos')
			.select('*')
			.eq('id', graficoId)
			.single()

		if (err) {
			error(404, err.message)
		}
		return { mapId, graficoId, map, grafico }
	}

	return { mapId, graficoId, map }
}) satisfies PageServerLoad

import { parse } from 'csv-parse'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals }) => {
	const session = await locals.safeGetSession()
	const supabase = locals.supabase
	// const CodMun = session.user?.user_metadata.municipio
	// 3100401
	const CodMun = '3100401'

	if (!CodMun) {
		return new Response(
			'Usuário não encontrado, por favor faça login novamente',
			{ status: 404 },
		)
	}

	const { data: maps, error } = await supabase
		.from('csv_dataset')
		.select('*')
		.eq('CodMun', CodMun)

	if (error) {
		return new Response('Erro ao obter mapas', {
			status: 404,
		})
	}

	const doencaMAP = new Map<string, number>()

	for (let index = 0; index < maps.length; index++) {
		const map = maps[index]

		const velho_csv_url = map.csv_url
		const velho_csv_req = await fetch(velho_csv_url)
		const velho_csv = await velho_csv_req.text()
		// const velho_csv_parsed = parse(velho_csv, {
		// 	columns: true,
		// 	skip_empty_lines: true,
		// })
		const quantidade_de_linhas =
			velho_csv.split('\n').length - 1

		// if doenca already in map then add to the value
		console.log(map.doenca, quantidade_de_linhas)

		const exist = doencaMAP.get(map.doenca)

		if (exist) {
			doencaMAP.set(
				map.doenca,
				exist + quantidade_de_linhas,
			)
		}
		// if doenca not in map then add to the map
		else {
			doencaMAP.set(map.doenca, quantidade_de_linhas)
		}
		console.log(doencaMAP)
	}

	const doencaMAP_JSON = JSON.stringify(
		Array.from(doencaMAP),
	)
	console.log(doencaMAP)

	return new Response(doencaMAP_JSON)
}

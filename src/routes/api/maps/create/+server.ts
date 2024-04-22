import { geocodeAddress, getDistanceFromLatLonInKm, sendEmail } from '$lib/utils'
import type { RequestHandler } from './$types'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'

export const POST: RequestHandler = async ({ request, locals }) => {
	const supabase = locals.supabase

	const {
		data: { session },
	} = await supabase.auth.getSession()

	const CodMun = session?.user?.user_metadata.municipio

	const { data: municipio, error: error_municipio } = await supabase
		.from('municipios')
		.select('*')
		.eq('CodMun', CodMun)
		.single()

	if (error_municipio) {
		return new Response(
			'Erro ao obter seu municipio, contacte suporte crossvirus!',
			{ status: 404 },
		)
	}

	console.log('form')
	const form = await request.formData()
	console.log(form)
	const csv = await form.get('csv')
	const campo_end = await form.get('campo_end')
	const ano = await form.get('ano')
	const doenca = await form.get('doenca')

	const fileName = `${municipio.nome}_${doenca}_${ano}.csv`

	if (
		!csv ||
		!(csv instanceof File) ||
		typeof campo_end !== 'string' ||
		typeof ano !== 'string' ||
		typeof doenca !== 'string'
	) {
		return new Response('Dados inválidos, por favor preencha todos os campos', {
			status: 404,
		})
	}

	const csvContent = await csv.text()
	const records = parse(csvContent, {
		columns: true,
		skip_empty_lines: true,
	})
	const headers = Object.keys(records[0])

	if (!headers.includes(campo_end)) {
		return new Response('Campo de endereço não encontrado no arquivo', {
			status: 404,
		})
	}

	// Geocodifica cada endereço e armazena o resultado
	for (const record of records) {
		const address = record[campo_end]
		if (address) {
			console.log('Geocodificando' + address)
			try {
				const location = await geocodeAddress(address)

				record['latitude'] = location?.lat ?? null
				record['longitude'] = location?.lng ?? null
			} catch (e) {
				console.error(e)
				console.warn(`Erro ao geocodificar o endereço: ${address}`)
			}
		}
	}

	console.log('geocodificacao COMPLETA')

	let { data: users_to_notify, error } = await supabase
		.from('info_user')
		.select('*')
		.eq('CodMun', municipio.CodMun)
		.gt('raio_alerta', 0)
	// NOTIFICACAO USERS
	if (users_to_notify) {
		const user_to_notify_map: {
			[key: string]: {
				enderecos_novos: string[]
			}
		} = {}

		console.log('Iniciando notificacao de users')

		for (const record1 of records) {
			// Verifica se algum dos endereços novos está dentro do raio de alerta de algum usuário
			for (const record2 of records) {
				const distance = getDistanceFromLatLonInKm(
					{
						lat: record1['latitude'],
						lon: record1['longitude'],
					},
					{
						lat: record2['latitude'],
						lon: record2['longitude'],
					},
				)
				for (const user of users_to_notify) {
					if (user.raio_alerta && distance <= user.raio_alerta) {
						if (!user_to_notify_map[user.email]) {
							user_to_notify_map[user.email] = {
								enderecos_novos: [],
							}
						}
						user_to_notify_map[user.email].enderecos_novos.push(
							record1[campo_end],
						)
					}
				}
			}
		}

		for (const not of Object.keys(user_to_notify_map)) {
			const user = user_to_notify_map[not]
			const email = not
			const enderecos = user.enderecos_novos
			const message = `Novos endereços próximos a você: ${enderecos.join(', ')}`
			console.log('Enviando email para ', email)
			const { ok } = await sendEmail(email, message)
			if (!ok) {
				console.log('Erro ao enviar email para ', email)
			}
		}

		console.log('Emails enviados com sucesso!')
	}


	const updatedCsvContent = stringify(records, {
		header: true,
		columns: Object.keys(records[0]),
	})
	const { data: storage_data, error: error_csv } = await supabase.storage
		.from('csv_maps')
		.upload(`${municipio.CodMun}/${fileName}`, updatedCsvContent)

	if (error_csv) {
		console.error(error_csv)
		return new Response(
			'Erro ao salvar o arquivo, provavelmente esse mapa ja existe \n Erro:' +
				error_csv.message,
			{ status: 404 },
		)
	}

	const {
		data: { publicUrl },
	} = supabase.storage.from('csv_maps').getPublicUrl(storage_data!.path)

	const { data: dataset_data, error: dataset_error } = await supabase
		.from('csv_dataset')
		.insert({
			title: `${municipio.nome} - ${doenca} - ${ano}`,
			csv_url: publicUrl,
			fields: headers,
			endereco: campo_end,
			CodMun: municipio.CodMun,
		})
		.select('*')

	if (dataset_error) {
		console.error(dataset_error)
		return new Response(
			'Erro ao salvar o dataset, contacte suporte crossvirus!',
			{ status: 404 },
		)
	}
	return new Response(JSON.stringify(dataset_data), {
		status: 200,
	})
}
import {
	geocodeAddress,
	getDistanceFromLatLonInKm,
	sendEmail,
	formatEmail,
} from '$lib/utils'
import type { RequestHandler } from './$types'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'

export const POST: RequestHandler = async ({
	request,
	locals,
}) => {
	const supabase = locals.supabase

	const { user, session } = await locals.safeGetSession()

	const CodMun = session?.user?.user_metadata.municipio
	const userID = session?.user.id

	if (!CodMun || !userID) {
		return new Response(
			'Usuário não encontrado, por favor faça login novamente',
			{ status: 404 },
		)
	}

	const { data: user_limit, error: err_user_limit } =
		await supabase
			.from('info_user')
			.select('*')
			.eq('auth_id', userID)
			.single()

	if (err_user_limit) {
		console.error(err_user_limit)
		return new Response(
			'Erro ao obter informações do usuário, contacte suporte crossvirus!',
			{ status: 404 },
		)
	}

	const limite_geopoints = user_limit?.limite_geopoints

	let used_geopoints = user_limit?.geopoints_utilizados

	const { data: municipio, error: error_municipio } =
		await supabase
			.from('municipios')
			.select('*')
			.eq('CodMun', CodMun)
			.single()

	if (error_municipio) {
		console.error(error_municipio)

		return new Response(
			'Erro ao obter seu municipio, contacte suporte crossvirus!',
			{ status: 404 },
		)
	}

	console.log('form')
	const form = await request.formData()
	const csv = form.get('csv')
	const campo_end = form.get('campo_end')
	const ano = form.get('ano')
	const doenca = form.get('doenca')
	console.log(form)

	const fileName = `${doenca}_${ano}.csv`

	if (
		!(csv instanceof File) ||
		typeof campo_end !== 'string' ||
		typeof ano !== 'string' ||
		typeof doenca !== 'string'
	) {
		console.error(
			'Dados inválidos, por favor preencha todos os campos',
		)
		return new Response(
			'Dados inválidos, por favor preencha todos os campos',
			{
				status: 404,
			},
		)
	}

	// check if file already exists
	const { data: dataset_exists } = await supabase.storage
		.from('csv_maps')
		.list(`${municipio.CodMun}/${fileName}`)
	if (
		dataset_exists?.length &&
		dataset_exists?.length > 0
	) {
		console.log(
			'Esse mapa já existe, por favor tente outro nome',
		)

		console.log(dataset_exists)

		return new Response(
			'Esse mapa já existe, por favor tente outro nome',
			{
				status: 404,
			},
		)
	}

	const csvContent = await csv.text()
	const records = parse(csvContent, {
		columns: true,
		skip_empty_lines: true,
	})
	const headers = Object.keys(records[0])

	if (!headers.includes(campo_end)) {
		console.error(
			'Campo de endereço não encontrado no arquivo',
		)
		return new Response(
			'Campo de endereço não encontrado no arquivo',
			{
				status: 404,
			},
		)
	}

	// Geocodifica cada endereço e armazena o resultado
	console.log('Iniciando geocodificacao')

	for (const record of records) {
		const address = record[campo_end]
		if (address) {
			console.log('Geocodificando' + address)
			try {
				const location = await geocodeAddress(address)
				used_geopoints++

				if (used_geopoints > limite_geopoints) {
					const { error: err_info_up } = await supabase
						.from('info_user')
						.update({
							geopoints_utilizados: used_geopoints,
						})
						.eq('auth_id', userID)
					if (err_info_up) {
						console.error(err_info_up.message)
					}

					return new Response(
						'Limite de geopoints atingido, por favor entre em contato com suporte crossvirus',
						{ status: 402 },
					)
				}

				record['latitude'] = location?.lat ?? null
				record['longitude'] = location?.lng ?? null
			} catch (e) {
				console.error(e)
				console.warn(
					`Erro ao geocodificar o endereço: ${address}`,
				)
			}
		}
	}

	await supabase
		.from('info_user')
		.update({
			geopoints_utilizados: used_geopoints,
		})
		.eq('auth_id', userID)

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
				enderecos_novos: {
					endereco: string
					lat: string
					long: string
				}[]
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
					if (
						user.raio_alerta &&
						distance <= user.raio_alerta
					) {
						if (!user_to_notify_map[user.email]) {
							user_to_notify_map[user.email] = {
								enderecos_novos: [],
							}
						}
						user_to_notify_map[
							user.email
						].enderecos_novos.push({
							endereco: record1[campo_end],
							lat: record1['latitude'],
							long: record1['longitude'],
						})
					}
				}
			}
		}

		for (const not of Object.keys(user_to_notify_map)) {
			const user = user_to_notify_map[not]
			const email = not
			const enderecos = user.enderecos_novos
			console.log('Enviando email para ', email)
			sendEmail(email, {
				enderecos,
				municipio: municipio.nome,
				map_link:
					'https://prefeitura.crossvirus.com.br/maps',
			})
		}

		console.log('Emails enviados com sucesso!')
	}

	const updatedCsvContent = stringify(records, {
		header: true,
		columns: Object.keys(records[0]),
	})
	const { data: storage_data, error: error_csv } =
		await supabase.storage
			.from('csv_maps')
			.upload(
				`${municipio.CodMun}/${fileName}`,
				updatedCsvContent,
				{
					upsert: true,
				},
			)

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
	} = supabase.storage
		.from('csv_maps')
		.getPublicUrl(storage_data!.path)

	const lat = records[0]['latitude']
	const long = records[0]['longitude']

	const { data: dataset_data, error: dataset_error } =
		await supabase
			.from('csv_dataset')
			.insert({
				title: `${municipio.nome} - ${doenca} - ${ano}`,
				csv_url: publicUrl,
				fields: headers,
				endereco: campo_end,
				CodMun: municipio.CodMun,
				ano: Number(ano),
				doenca: doenca,
				lat,
				long,
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

import {
	geocodeAddress,
	getDistanceFromLatLonInKm,
	sendEmail,
} from '$lib/utils'
import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'

export const POST: RequestHandler = async ({
	request,
	locals,
}) => {
	const supabase = locals.supabase
	const { user } = await locals.safeGetSession()
	const municipioUser = user?.user_metadata.municipio

	const formData = await request.formData()
	const file = formData.get('csv')
	const mapID = formData.get('map_id')

	if (
		!file ||
		!(file instanceof File) ||
		typeof mapID !== 'string'
	) {
		return new Response('Dados inválidos', { status: 404 })
	}

	const { data: map, error: err_csv_dataset } =
		await supabase
			.from('csv_dataset')
			.select('*')
			.eq('id', mapID)
			.single()

	if (err_csv_dataset || map.CodMun !== municipioUser) {
		return new Response('Erro ao obter mapa', {
			status: 404,
		})
	}

	if (!user?.id) {
		return new Response('Erro ao obter user ID', {
			status: 404,
		})
	}

	const { data: user_limit, error: err_user_limit } =
		await supabase
			.from('info_user')
			.select('*')
			.eq('auth_id', user.id)
			.single()

	if (err_user_limit) {
		console.error(err_user_limit)
		return new Response(
			'Erro ao obter informações do usuário, contacte suporte crossvirus!',
			{ status: 404 },
		)
	}

	const limite_geopoints = user_limit?.limite_geopoints

	let used_geopoints = user_limit?.geopoints_utilizados ?? 0

	const addressField = map.endereco
	const fileName = `${map.doenca}_${map.ano}.csv`

	const csvContent = await file.text()
	const novo_csv_parsed = parse(csvContent, {
		columns: true,
		skip_empty_lines: true,
	})

	const headers = Object.keys(novo_csv_parsed[0])

	if (!headers.includes(addressField)) {
		return new Response('Campo de endereço inválido', {
			status: 404,
		})
	}

	// Geocodifica cada endereço e armazena o resultado
	for (const novo_csv_record of novo_csv_parsed) {
		const address = novo_csv_record[addressField]
		if (address) {
			console.log(address)
			try {
				const location = await geocodeAddress(address)
				used_geopoints++
				if (used_geopoints > limite_geopoints) {
					const { error: err_info_up } = await supabase
						.from('info_user')
						.update({
							geopoints_utilizados: used_geopoints,
						})
						.eq('auth_id', user.id)
					if (err_info_up) {
						console.error(err_info_up.message)
					}

					return new Response(
						'Limite de geopoints atingido, por favor entre em contato com suporte crossvirus',
						{ status: 402 },
					)
				}

				novo_csv_record['latitude'] = location?.lat ?? null
				novo_csv_record['longitude'] = location?.lng ?? null
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
		.eq('auth_id', user.id)

	const velho_csv_url = map.csv_url
	const velho_csv_req = await fetch(velho_csv_url)
	const velho_csv = await velho_csv_req.text()
	const velho_csv_parsed = parse(velho_csv, {
		columns: true,
		skip_empty_lines: true,
	})
	let { data: users_to_notify, error } = await supabase
		.from('info_user')
		.select('*')
		.eq('CodMun', map.CodMun)
		.gt('raio_alerta', 0)

	// NOTIFICACAO USERS
	if (users_to_notify) {
		const user_to_notify_map: {
			[key: string]: {
				enderecos: {
					endereco: string
					lat: string
					long: string
				}[]
			}
		} = {}
		console.log('Iniciando notificacao de users')

		for (const novo_csv_record of novo_csv_parsed) {
			// Verifica se algum dos endereços novos está dentro do raio de alerta de algum usuário
			for (const novo_csv_record2 of novo_csv_parsed) {
				const distance = getDistanceFromLatLonInKm(
					{
						lat: novo_csv_record['latitude'],
						lon: novo_csv_record['longitude'],
					},
					{
						lat: novo_csv_record2['latitude'],
						lon: novo_csv_record2['longitude'],
					},
				)
				for (const user of users_to_notify) {
					if (
						user.raio_alerta &&
						distance <= user.raio_alerta
					) {
						if (!user_to_notify_map[user.email]) {
							user_to_notify_map[user.email] = {
								enderecos: [],
							}
						}
						user_to_notify_map[user.email].enderecos.push({
							endereco: novo_csv_record2[addressField],
							lat: novo_csv_record2['latitude'],
							long: novo_csv_record2['longitude'],
						})
					}
				}
			}

			for (const velho_csv_record of velho_csv_parsed) {
				const distance = getDistanceFromLatLonInKm(
					{
						lat: novo_csv_record['latitude'],
						lon: novo_csv_record['longitude'],
					},
					{
						lat: velho_csv_record['latitude'],
						lon: velho_csv_record['longitude'],
					},
				)
				for (const user of users_to_notify) {
					if (
						user.raio_alerta &&
						distance <= user.raio_alerta
					) {
						if (!user_to_notify_map[user.email]) {
							user_to_notify_map[user.email] = {
								enderecos: [],
							}
						}
						user_to_notify_map[user.email].enderecos.push({
							endereco: velho_csv_record[addressField],
							lat: velho_csv_record['latitude'],
							long: velho_csv_record['longitude'],
						})
					}
				}
			}
		}

		for (const not of Object.keys(user_to_notify_map)) {
			const user = user_to_notify_map[not]
			const email = not
			const enderecos = user.enderecos
			console.log('Enviando email para ', email)
			sendEmail(email, {
				enderecos,
				municipio: map.title,
				map_link: 'https://prefeitura.crossvirus.com.br/maps/' + map.id,
			})
		}

		console.log('Emails enviados com sucesso!')
	}

	//  concat velho_csv_parsed com novo_csv_parsed

	const concat_csv =
		velho_csv_parsed.concat(novo_csv_parsed)
	const novoCSVContent = stringify(concat_csv, {
		header: true,
		columns: Object.keys(velho_csv_parsed[0]),
	})

	const formatedName = fileName
	console.log('salvando updated csv')
	console.log(formatedName)

	// console.log(novoCSVContent)
	const { data: storage_data, error: error_csv } =
		await supabase.storage
			.from('csv_maps')
			.update(
				`${map.CodMun}/${formatedName}`,
				novoCSVContent,
				{
					upsert: true,
				},
			)

	if (error_csv) {
		console.error('supabase.storage error:')
		console.error(error_csv)
		return new Response(error_csv.message, {
			status: 500,
		})
	}
	const {
		data: { publicUrl },
	} = supabase.storage
		.from('csv_maps')
		.getPublicUrl(storage_data!.path)

	const { data: dataset_data, error: dataset_error } =
		await supabase
			.from('csv_dataset')
			.update({
				created_at: new Date().toISOString(),
			})
			.eq('id', map.id)
	if (dataset_error) {
		console.error('supabase error:')
		console.error(dataset_error)
		return new Response(dataset_error.message, {
			status: 404,
		})
	}

	console.log('csv concluido', formatedName)
	return new Response('CSV atualizado com sucesso', {
		status: 200,
	})
}

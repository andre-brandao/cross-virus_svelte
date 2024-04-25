import type { Actions, PageServerLoad } from './$types'
import {
	geocodeAddress,
	getDistanceFromLatLonInKm,
	sendEmail,
} from '$lib/utils'
import { error, redirect } from '@sveltejs/kit'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'
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

// export const actions: Actions = {
// 	default: async ({ locals, request, params }) => {
// 		const supabase = locals.supabase
// 		const { user } = await locals.safeGetSession()
// 		const municipioUser = user?.user_metadata.municipio

// 		const formData = await request.formData()
// 		const file = formData.get('csv')
// 		const mapID = formData.get('map_id')

// 		if (
// 			!file ||
// 			!(file instanceof File) ||
// 			typeof mapID !== 'string'
// 		) {
// 			return new Response('Dados inválidos', {
// 				status: 404,
// 			})
// 		}

// 		const { data: map, error: err_csv_dataset } =
// 			await supabase
// 				.from('csv_dataset')
// 				.select('*')
// 				.eq('id', mapID)
// 				.single()

// 		if (err_csv_dataset || map.CodMun !== municipioUser) {
// 			return new Response('Erro ao obter mapa', {
// 				status: 404,
// 			})
// 		}

// 		const addressField = map.endereco
// 		const fileName = map.title

// 		const csvContent = await file.text()
// 		const novo_csv_parsed = parse(csvContent, {
// 			columns: true,
// 			skip_empty_lines: true,
// 		})

// 		const headers = Object.keys(novo_csv_parsed[0])

// 		if (!headers.includes(addressField)) {
// 			return new Response('Campo de endereço inválido', {
// 				status: 404,
// 			})
// 		}

// 		// Geocodifica cada endereço e armazena o resultado
// 		for (const novo_csv_record of novo_csv_parsed) {
// 			const address = novo_csv_record[addressField]
// 			if (address) {
// 				console.log(address)
// 				try {
// 					const location = await geocodeAddress(address)
// 					novo_csv_record['latitude'] =
// 						location?.lat ?? null
// 					novo_csv_record['longitude'] =
// 						location?.lng ?? null
// 				} catch (e) {
// 					console.error(e)
// 					console.warn(
// 						`Erro ao geocodificar o endereço: ${address}`,
// 					)
// 				}
// 			}
// 		}

// 		const velho_csv_url = map.csv_url
// 		const velho_csv_req = await fetch(velho_csv_url)
// 		const velho_csv = await velho_csv_req.text()
// 		const velho_csv_parsed = parse(velho_csv, {
// 			columns: true,
// 			skip_empty_lines: true,
// 		})
// 		let { data: users_to_notify, error } = await supabase
// 			.from('info_user')
// 			.select('*')
// 			.eq('CodMun', map.CodMun)
// 			.gt('raio_alerta', 0)

// 		// NOTIFICACAO USERS
// 		if (users_to_notify) {
// 			const user_to_notify_map: {
// 				[key: string]: {
// 					enderecos_novos: string[]
// 				}
// 			} = {}

// 			console.log('Iniciando notificacao de users')

// 			for (const novo_csv_record of novo_csv_parsed) {
// 				// Verifica se algum dos endereços novos está dentro do raio de alerta de algum usuário
// 				for (const novo_csv_record2 of novo_csv_parsed) {
// 					const distance = getDistanceFromLatLonInKm(
// 						{
// 							lat: novo_csv_record['latitude'],
// 							lon: novo_csv_record['longitude'],
// 						},
// 						{
// 							lat: novo_csv_record2['latitude'],
// 							lon: novo_csv_record2['longitude'],
// 						},
// 					)
// 					for (const user of users_to_notify) {
// 						if (
// 							user.raio_alerta &&
// 							distance <= user.raio_alerta
// 						) {
// 							if (!user_to_notify_map[user.email]) {
// 								user_to_notify_map[user.email] = {
// 									enderecos_novos: [],
// 								}
// 							}
// 							user_to_notify_map[
// 								user.email
// 							].enderecos_novos.push(
// 								novo_csv_record[addressField],
// 							)
// 						}
// 					}
// 				}

// 				for (const velho_csv_record of velho_csv_parsed) {
// 					const distance = getDistanceFromLatLonInKm(
// 						{
// 							lat: novo_csv_record['latitude'],
// 							lon: novo_csv_record['longitude'],
// 						},
// 						{
// 							lat: velho_csv_record['latitude'],
// 							lon: velho_csv_record['longitude'],
// 						},
// 					)
// 					for (const user of users_to_notify) {
// 						if (
// 							user.raio_alerta &&
// 							distance <= user.raio_alerta
// 						) {
// 							if (!user_to_notify_map[user.email]) {
// 								user_to_notify_map[user.email] = {
// 									enderecos_novos: [],
// 								}
// 							}
// 							user_to_notify_map[
// 								user.email
// 							].enderecos_novos.push(
// 								novo_csv_record[addressField],
// 							)
// 						}
// 					}
// 				}
// 			}

// 			for (const not of Object.keys(user_to_notify_map)) {
// 				const user = user_to_notify_map[not]
// 				const email = not
// 				const enderecos = user.enderecos_novos
// 				const message = `Novos endereços próximos a você: ${enderecos.join(', ')}`
// 				console.log('Enviando email para ', email)
// 				const { ok } = await sendEmail(email, message)
// 				if (!ok) {
// 					console.log('Erro ao enviar email para ', email)
// 				}
// 			}

// 			console.log('Emails enviados com sucesso!')
// 		}

// 		for (const novo_csv_record of novo_csv_parsed) {
// 			velho_csv_parsed.push(novo_csv_record)
// 		}
// 		console.log('CSVs merged ', addressField)

// 		const novoCSVContent = stringify(velho_csv_parsed, {
// 			header: true,
// 			columns: Object.keys(velho_csv_parsed[0]),
// 		})

// 		const formatedName = fileName
// 		console.log('salvando updated csv')
// 		console.log(formatedName)

// 		console.log(novoCSVContent)
// 		const { data: storage_data, error: error_csv } =
// 			await supabase.storage
// 				.from('csv_maps')
// 				.update(
// 					`${map.CodMun}/${formatedName}`,
// 					novoCSVContent,
// 					{
// 						upsert: true,
// 					},
// 				)

// 		if (error_csv) {
// 			console.error('supabase.storage error:')
// 			console.error(error_csv)
// 			return new Response(error_csv.message, {
// 				status: 500,
// 			})
// 		}
// 		const {
// 			data: { publicUrl },
// 		} = supabase.storage
// 			.from('csv_maps')
// 			.getPublicUrl(storage_data!.path)

// 		const { data: dataset_data, error: dataset_error } =
// 			await supabase
// 				.from('csv_dataset')
// 				.update({
// 					created_at: new Date().toISOString(),
// 				})
// 				.eq('id', map.id)
// 		if (dataset_error) {
// 			console.error('supabase error:')
// 			console.error(dataset_error)
// 			return new Response(dataset_error.message, {
// 				status: 404,
// 			})
// 		}

// 		console.log('csv concluido', formatedName)
// 		redirect(303, '/succes')
// 	},
// }

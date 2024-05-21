import nodemailer from 'nodemailer'
import {
	GOOGLE_MAPS_KEY,
	GMAIL_PASSWORD,
} from '$env/static/private'

import { Client } from '@googlemaps/google-maps-services-js'
const maps_client = new Client({})

export async function geocodeAddress(address: string) {
	console.log('Geocodificando' + address)
	try {
		const result = await maps_client.geocode({
			params: {
				address: address,
				key: GOOGLE_MAPS_KEY,
			},
		})

		const location =
			result.data.results[0]?.geometry.location
		return location
	} catch (e) {
		console.error(e)
		console.warn(
			`Erro ao geocodificar o endereço: ${address}`,
		)
	}
}

export async function createGoogleMapsURL(
	coordinates: {
		lat: string
		long: string
	}[],
) {
	try {
		const markersQuery = coordinates
			.map(
				(coord, index) =>
					`markers=color:red%7Clabel:${index + 1}%7C${coord.lat},${coord.long}`,
			)
			.join('&')

		const baseURL = `https://www.google.com/maps/dir/?api=1&travelmode=driving&`
		const markersURL = `${baseURL}${markersQuery}&key=${GOOGLE_MAPS_KEY}`

		console.log(
			'Generated Google Maps URL with markers:',
			markersURL,
		)
		return markersURL
	} catch (error) {
		console.error(
			'Error generating Google Maps URL:',
			error,
		)
	}
}
export async function sendEmail(
	to: string,
	email: {
		municipio: string
		enderecos: {
			endereco: string
			lat: string
			long: string
		}[]
		map_link: string
	},
) {
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'admin@crossgeo.com.br',
			pass: GMAIL_PASSWORD,
		},
	})

	const mailOptions = {
		from: 'admin@crossgeo.com.br',
		to: to, // Use the 'to' field from the request body
		subject: 'Alerta Crossvirus',
		html: formatEmail(email), // Use the 'text' field from the request body
	}

	try {
		await transporter.sendMail(mailOptions)
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			error: error,
		}
	}
	return {
		ok: true,
	}
}

export function getDistanceFromLatLonInKm(
	position1: { lat: number; lon: number },
	position2: { lat: number; lon: number },
) {
	var deg2rad = (deg: number) => {
			return deg * (Math.PI / 180)
		},
		R = 6371,
		dLat = deg2rad(position2.lat - position1.lat),
		dLng = deg2rad(position2.lon - position1.lon),
		a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(deg2rad(position1.lat)) *
				Math.cos(deg2rad(position1.lat)) *
				Math.sin(dLng / 2) *
				Math.sin(dLng / 2),
		c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	return R * c * 1000
}
export function formatEmail(email: {
    municipio: string;
    enderecos: {
        endereco: string;
        lat: string;
        long: string;
    }[];
    map_link: string;
}) {
    const staticMapsBaseUrl = 'https://maps.googleapis.com/maps/api/staticmap';
    const interactableBaseUrl = 'https://www.google.com/maps/embed/v1/view';
    const markers = email.enderecos
        .map((end) => `${end.lat},${end.long}`)
        .join('|');
    const staticMapUrl = `${staticMapsBaseUrl}?size=600x400&maptype=roadmap&markers=color:red|${encodeURIComponent(markers)}&key=${GOOGLE_MAPS_KEY}`;
    const firstMarker = email.enderecos[0];
    const interactableMapsUrl = `${interactableBaseUrl}?key=${GOOGLE_MAPS_KEY}&center=${firstMarker.lat},${firstMarker.long}&zoom=15`;
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alerta de Email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff;">
    <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #f4f4f4; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #333; text-align: center;">Alerta <span style="color: #c00000;">Crossvirus</span></h1>
        <h3 style="color: #666; text-align: center;">Foram encontrados novos casos em <span style="color: #FFA500;">${email.municipio}</span></h3>
        <img src="${staticMapUrl}" alt="Mapa com marcadores" style="width: 100%; height: auto; border-radius: 8px; margin: 20px 0;">
        <a href="${interactableMapsUrl}" target="_blank" style="display: block; margin: 20px 0; text-align: center; color: #007BFF; text-decoration: none;">Visualizar no Google Maps</a>
        <h3 style="color: #666;">Caso tenha alguma dúvida, entre em contato com nossa equipe!</h3>
        <h3><a href="${email.map_link}" target="_blank" style="color: #007BFF; text-decoration: none;">Clique aqui para visualizar o mapa no CrossVirus</a></h3>
    </div>
</body>
</html>
    `;
}


// <gmp-map
// center="${email.enderecos[0].lat},${email.enderecos[0].long}"
// zoom="4"
// map-id="DEMO_MAP_ID"
// style="height: 400px"
// >
// ${email.enderecos.slice(0,5).map((e) => {
//   return `<gmp-advanced-marker
//   position="${e.lat},${e.long}"
//   title="${e.endereco}">
//   </gmp-advanced-marker>`
// })}
// </gmp-map>
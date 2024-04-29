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

export async function sendEmail(
	to: string,
	email: {
		municipio: string
		enderecos: string[]
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
	var deg2rad = function (deg: number) {
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
	municipio: string
	enderecos: string[]
	map_link: string
}) {
	return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Alerta de Email</title>
	<style>
      body {
        margin: 0;
        padding: 0;
        background-color: #ffffff;
      }

      .container {
        max-width: 600px;
        margin: 20px auto;
        padding: 20px;
        background-color: #f4f4f4;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }

      h1 {
        color: #333;
        text-align: center;
      }

      h3 {
        color: #666;
      }

      ul {
        padding-left: 20px;
      }

      li {
        margin-bottom: 5px;
        color: #888;
      }
    </style>
	</head>
	<body>
	<div class="container">
	<h1>Alerta <span style="color: #c00000;">Crossvirus</span></h1>
	<h3 style="text-align: center;">Foram encontrados novos casos em <span style="color: #FFA500;">${email.municipio}</span></h3>
	  <ul>
	${email.enderecos.map((e) => {
		return `
		<li>  
		${e}
		</li>
		`
	})}
	</ul>
		<h3>
        Caso tenha alguma duvida entre em contato com nossa equipe!
      </h3>
	  <h3>
		<a href="${email.map_link}">Clique aqui para visualizar no mapa</a>
		</h3>
	  </div>
  </body>
  </html>
	`
}

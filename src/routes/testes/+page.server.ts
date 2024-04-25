import type { PageServerLoad, Actions } from './$types'
import { sendEmail, formatEmail } from '$lib/utils'

export const load = (async () => {
	return {}
}) satisfies PageServerLoad

export const actions: Actions = {
	default: async ({ request, locals }) => {
		await sendEmail('oliveira.brenobrandao@gmail.com', formatEmail(['Rua paraiba 710','Avenida sao francisco 498']))
	},
}

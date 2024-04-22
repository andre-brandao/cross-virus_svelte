import type { Actions, PageServerLoad } from './$types'

export const load = (async () => {
	return {}
}) satisfies PageServerLoad

export const actions: Actions = {
	login: async ({ locals, request }) => {
		const supabase = locals.supabase
		const form = await request.formData()
		const email = form.get('email') as string
		const password = form.get('password') as string

		if (typeof email !== 'string' && typeof password !== 'string') {
			return new Response('email ou senha invalido', { status: 404 })
		}

		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		})
		if (error) {
			console.error(error)
			return new Response(error.message, { status: 404 })
		}
		return new Response('Ok', { status: 202 })
	},
	cadastro: ({ locals }) => {
		const supabase = locals.supabase
	},
}

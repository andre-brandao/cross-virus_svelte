import { error, redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load = (async ({
	locals: { supabase, safeGetSession },
	url,
}) => {
	const { user, session } = await safeGetSession()

	if (!user) {
		redirect(303, '/login')
	}

	const { data: info, error: err } = await supabase
		.from('info_user')
		.select('*')
		.eq('auth_id', user.id)
		.single()

	if (err) {
		error(404, err.message)
	}
	return { info }
}) satisfies PageServerLoad

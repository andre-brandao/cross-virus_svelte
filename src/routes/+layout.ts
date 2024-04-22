import {
	PUBLIC_SUPABASE_ANON_KEY,
	PUBLIC_SUPABASE_URL,
} from '$env/static/public'
import { error } from '@sveltejs/kit'
import type { LayoutLoad } from './$types'
import { createBrowserClient, isBrowser, parse } from '@supabase/ssr'
import type { Database } from '$lib/supabase-types'

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
	depends('supabase:auth')

	const supabase = createBrowserClient<Database>(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			global: {
				fetch,
			},
			cookies: {
				get(key) {
					if (!isBrowser()) {
						return JSON.stringify(data.session)
					}

					const cookie = parse(document.cookie)
					return cookie[key]
				},
			},
		},
	)

	/**
	 * It's fine to use `getSession` here, because on the client, `getSession` is
	 * safe, and on the server, it reads `session` from the `LayoutData`, which
	 * safely checked the session using `safeGetSession`.
	 */
	const {
		data: { session },
	} = await supabase.auth.getSession()

	const user = session?.user

	if (!user) {
		return { supabase, session }
	}

	const municipioID = user?.user_metadata.municipio

	const { data: municipio, error: err_municipio } = await supabase
		.from('municipios')
		.select('*')
		.eq('CodMun', municipioID)
		.single()

	if (err_municipio) {
		error(404, err_municipio.message)
	}

	return { supabase, session, municipio }
}

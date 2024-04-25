import type { PageLoad } from './$types'

export const ssr = false

export const load = (async ({data}) => {
	let map = data.map
	
	return {map}
}) satisfies PageLoad

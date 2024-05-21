
export async function getCasosFromMapURL(url: string) {
	const csv_request = await fetch(url)
	const csv = await csv_request.text()
	return csv.split('\n').length - 1
}

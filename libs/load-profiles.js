export async function loadProfiles(params) {
    const res = await fetch(process.env.API_URL + '?' + params)
    return await res.json()
}
export async function loadProfiles(params) {
    let hasTag = params.includes("tags")
    if (hasTag) {
        const res = await fetch(process.env.INDEX_URL + '?' + params)
        return await res.json()
    }
    const res = await fetch(process.env.API_URL + '/profiles?' + params)
    return await res.json()
}

export async function loadProfile(profileUrl) {
    const res = await fetch(process.env.API_URL + '/profile?profile_url=' + profileUrl)
    return await res.json()
}
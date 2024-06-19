export async function loadSchemas() {
  try {
    const res = await fetch(process.env.LIBRARY_URL + '/v2/schemas')
    if (!res.ok) {
      const data = await handleNotOK(res)
      throw new Response(JSON.stringify(data), {
        status: res.status
      })
    }
    const schemas = await res.json()
    return schemas?.data.map(item => item.name)
  } catch (e) {
    if (e instanceof Response) {
      throw e
    } else {
      throw new Response(`loadSchemas error: ${e.message || e}`, {
        status: 500
      })
    }
  }
}

export async function loadProfiles(params) {
  try {
    const hasName = params.includes('name')
    const hasTags = params.includes('tags')
    const hasRange = params.includes('range')
    if (hasName || hasTags || hasRange) {
      const res = await fetch(
        process.env.INDEX_URL +
          '/v2/get-nodes?page_size=10000&status=posted&' +
          params
      )
      return await res.json()
    }
    const hasSchema = params.includes('schema')
    const res = await fetch(
      process.env.ALLOCATOR_URL +
        '/profiles?status=posted&' +
        (hasSchema ? '' : 'schema=organizations_schema-v1.0.0') +
        params
    )
    if (!res.ok) {
      const data = await handleNotOK(res)
      throw new Response(JSON.stringify(data), {
        status: res.status
      })
    }
    return await res.json()
  } catch (e) {
    if (e instanceof Response) {
      throw e
    } else {
      throw new Response(`loadProfiles error: ${e.message || e}`, {
        status: 500
      })
    }
  }
}

export async function loadProfile(profileUrl) {
  try {
    const res = await fetch(
      window.ENV.ALLOCATOR_URL + '/profile?profile_url=' + profileUrl
    )
    if (!res.ok) {
      const data = await handleNotOK(res)
      throw new Response(JSON.stringify(data), {
        status: res.status
      })
    }

    return await res.json()
  } catch (e) {
    if (e instanceof Response) {
      throw e
    } else {
      throw new Response(`loadProfile error: ${e.message || e}`, {
        status: 500
      })
    }
  }
}

async function handleNotOK(res) {
  let data
  const contentType = res.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    data = await res.json()
  } else {
    data = await res.text()
  }
  return data
}

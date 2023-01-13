export async function loadSchemas() {
  const res = await fetch(process.env.CDN_URL)
  return await res.json()
}

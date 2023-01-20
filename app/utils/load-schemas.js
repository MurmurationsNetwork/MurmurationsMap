export async function loadSchemas() {
  try {
    const res = await fetch(process.env.CDN_URL);
    return await res.json();
  } catch (e) {
    throw new Response(`loadSchemas error: ${e}`, {
      status: 500,
    });
  }
}

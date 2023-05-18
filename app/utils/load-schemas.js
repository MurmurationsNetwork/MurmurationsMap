export async function loadSchemas() {
  try {
    const res = await fetch(process.env.LIBRARY_URL + "/v2/schemas");
    const schemasJson = await res.json();
    return schemasJson?.data.map((item) => item.name);
  } catch (e) {
    throw new Response(`loadSchemas error: ${e}`, {
      status: 500,
    });
  }
}

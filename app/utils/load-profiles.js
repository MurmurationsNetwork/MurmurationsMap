export async function loadProfiles(params) {
  try {
    const hasTags = params.includes("tags");
    const hasRange = params.includes("range");
    if (hasTags || hasRange) {
      const res = await fetch(
        process.env.INDEX_URL + "?page_size=10000&status=posted&" + params
      );
      return await res.json();
    }
    const res = await fetch(
      process.env.API_URL + "/profiles?status=posted&" + params
    );
    return await res.json();
  } catch (e) {
    throw new Response(`loadProfiles error: ${e}`, {
      status: 500,
    });
  }
}

export async function loadProfile(profileUrl) {
  try {
    const res = await fetch(
      window.ENV.API_URL + "/profile?profile_url=" + profileUrl
    );
    return await res.json();
  } catch (e) {
    throw new Response(`loadProfile error: ${e}`, {
      status: 500,
    });
  }
}

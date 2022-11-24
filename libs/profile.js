import clientPromise from './mongo'

export async function getProfiles() {
  try {
    const client = await clientPromise
    const db = client.db('mapdata')
    const profiles = await db.collection('profiles').find({}).toArray()

    return {
      profiles
    }
  } catch (e) {
    console.error(e)
  }
}

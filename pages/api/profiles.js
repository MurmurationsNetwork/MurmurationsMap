import clientPromise from '../../libs/mongo'

export default async function handler(req, res) {
  let queries = { geolocation: { $exists: true } }
  if (req?.query?.schema) {
    queries.linked_schemas = { $in: [req.query.schema] }
  }
  if (req?.query?.tags) {
    let tags = req.query.tags.split(',')
    queries.tags = { $all: tags }
  }
  let skip = 0
  if (req?.query?.skip) {
    skip = parseInt(req.query.skip, 0)
  }

  const client = await clientPromise
  const db = client.db('mapdata')
  const doc = await db
    .collection('profiles')
    .find(queries)
    .project({ geolocation: 1, primary_url: 1 })
    .skip(skip)
    .limit(100)
    ?.toArray()
  res.status(200).json(doc)
}

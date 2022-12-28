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

  const client = await clientPromise
  const db = client.db('mapdata')
  let doc = await db.collection('profiles').find(queries)?.toArray()
  res.status(200).json(doc)
}

export const config = {
  api: {
    responseLimit: '20mb'
  }
}

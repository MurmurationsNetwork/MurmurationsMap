import nextConnect from 'next-connect'
import middleware from '../../libs/database'

const handler = nextConnect()

handler.use(middleware)

handler.get(async (req, res) => {
  let queries = { geolocation: { $exists: true } }
  if (req?.query?.schema) {
    queries.linked_schemas = { $in: [req.query.schema] }
  }
  if (req?.query?.tags) {
    let tags = req.query.tags.split(',')
    queries.tags = { $all: tags }
  }
  let doc = await req.db.collection('profiles').find(queries)?.toArray()
  res.json({ profiles: doc })
})

export default handler

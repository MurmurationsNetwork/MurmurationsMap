import Head from 'next/head'
import Map from '../components/map'
import { useEffect, useState } from 'react'

const DEFAULT_CENTER = [48.864716, 2.349014]

async function fetchData(params, count) {
  let res = await fetch('/api/profiles?' + params + 'skip=' + count)
  return await res.json()
}

async function fetchProfileSize(params) {
  let res = await fetch('/api/size?' + params)
  return await res.json()
}

export default function Home({ schemas }) {
  const [profiles, setProfiles] = useState([])
  const [schema, setSchema] = useState('')
  const [tags, setTags] = useState('')
  const [count, setCount] = useState(0)
  const [params, setParams] = useState('')
  const [profileSize, setProfileSize] = useState(0)
  const [loading, setLoading] = useState(false)

  if (count === 0) {
    fetchProfileSize(params).then(data => {
      setProfileSize(data)
    })
  }

  useEffect(() => {
    setLoading(true)
    if (count >= profileSize) {
      setLoading(false)
      return
    }
    fetchData(params, count).then(data => {
      if (data.length !== 0) {
        setProfiles(profiles.concat(data))
        setCount(count + data.length)
      }
    })
  }, [count, params, profileSize, profiles])

  const handleSubmit = async event => {
    // Stop the form from submitting and refreshing the page.
    event.preventDefault()

    const data = {
      schema: event.target.schema.value,
      tags: event.target.tags.value
    }

    let getParams = ''
    if (data.schema !== '') {
      getParams += 'schema=' + data.schema + '&'
    }
    if (data.tags !== '') {
      getParams += 'tags=' + data.tags + '&'
    }

    setCount(0)
    setProfiles([])
    setParams(getParams)
  }

  return (
    <div>
      <Head>
        <title>Murmurations Map</title>
        <meta name="description" content="Murmurations Map" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col h-screen">
        <form
          onSubmit={handleSubmit}
          className="basis-1/12 flex justify-center items-center flex-col text-center md:flex-row md:justify-evenly md:px-96 md:mx-24"
        >
          <div>
            <select
              className="border rounded block w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
              name="schema"
            >
              <option value="">All schemas</option>
              {schemas?.map(s => (
                <option
                  className="text-sm mb-1 border-gray-50 py-0 px-2"
                  value={s}
                  key={s}
                >
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="Tags"
              name="tags"
            />
          </div>
          <div>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Filter
            </button>
          </div>
        </form>
        <div className="basis-11/12">
          {loading ? (
            <h2 className="text-center">Map is drawing...</h2>
          ) : (
            <Map className="w-full h-full" center={DEFAULT_CENTER} zoom={4}>
              {(TileLayer, Marker, Popup, MarkerClusterGroup) => (
                <>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <MarkerClusterGroup>
                    {profiles.map(profile => (
                      <Marker
                        key={profile._id}
                        position={[
                          profile?.geolocation?.lat,
                          profile?.geolocation?.lon
                        ]}
                      >
                        <Popup>{profile?.primary_url}</Popup>
                      </Marker>
                    ))}
                  </MarkerClusterGroup>
                </>
              )}
            </Map>
          )}
        </div>
      </div>
    </div>
  )
}

export async function getStaticProps(context) {
  const res = await fetch(process.env.CDN_URL)
  const json = await res.json()

  return {
    props: {
      schemas: json?.schema_list
    }
  }
}

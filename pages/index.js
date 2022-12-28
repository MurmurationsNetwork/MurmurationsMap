import Head from 'next/head'
import Map from '../components/map'
import { useState } from 'react'

const DEFAULT_CENTER = [48.864716, 2.349014]

export default function Home({ data }) {
  const [profiles, setProfiles] = useState(data.profiles)
  const [schema, setSchema] = useState('')
  const [tags, setTags] = useState('')
  const schemas = data.schemas

  const getProfiles = async event => {
    let getParams = ''
    if (schema !== '') {
      getParams += 'schema=' + schema + '&'
    }
    if (tags !== '') {
      getParams += 'tags=' + tags
    }

    const res = await fetch('/api/profiles?' + getParams)
    const json = await res.json()

    setProfiles(json?.profiles)
  }

  return (
    <div>
      <Head>
        <title>Murmurations Map</title>
        <meta name="description" content="Murmurations Map" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col h-screen">
        <div className="basis-1/12 flex justify-center items-center flex-col text-center md:flex-row md:justify-evenly md:px-96 md:mx-24">
          <div>
            <select
              className="border rounded block w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
              name="schema"
              value={schema}
              onChange={e => setSchema(e.target.value)}
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
              value={tags}
              onChange={e => setTags(e.target.value)}
            />
          </div>
          <div>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={getProfiles}
            >
              Filter
            </button>
          </div>
        </div>
        <div className="basis-11/12">
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
        </div>
      </div>
    </div>
  )
}

export async function getStaticProps(context) {
  const res = await fetch(process.env.HOST + '/api/profiles')
  const json = await res.json()

  const cdnRes = await fetch(process.env.CDN_URL)
  const cdnJson = await cdnRes.json()
  return {
    props: {
      data: {
        profiles: json?.profiles,
        schemas: cdnJson?.schema_list
      }
    }
  }
}

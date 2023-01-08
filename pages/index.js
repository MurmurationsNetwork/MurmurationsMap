import Head from 'next/head'
import Map from '../components/map'
import { useEffect, useState } from 'react'
import {loadSchemas} from "../libs/load-schemas";
import {loadProfile, loadProfiles} from "../libs/load-profiles";

const DEFAULT_CENTER = [48.864716, 2.349014]

export default function Home({ schemas }) {
  const [profiles, setProfiles] = useState([])
  const [params, setParams] = useState('')
  const [loading, setLoading] = useState(false)
  const [primaryUrl, setPrimaryUrl] = useState('')
  const [tags, setTags] = useState('')

  useEffect(() => {
    setLoading(true)
    loadProfiles(params).then(data => {
      if (data.data?.length !== 0) {
        setProfiles(data.data)
        setLoading(false)
      }
    })
  }, [params])


  const handleSubmit = async event => {
    // Stop the form from submitting and refreshing the page.
    event.preventDefault()

    const data = {
      schema: event.target.schema.value,
      tags: event.target.tags.value,
      primary_url: event.target.primary_url.value,
      last_updated: event.target.last_updated.value
    }

    let getParams = ''
    if (data.schema !== '') {
      getParams += 'schema=' + data.schema + '&'
    }
    if (data.tags !== '') {
      getParams += 'tags=' + data.tags + '&'
    }
    if (data.primary_url !== '') {
      getParams += 'primary_url=' + data.primary_url + '&'
    }
    if (data.last_updated !== '') {
      const timestamp = Date.parse(data.last_updated) / 1000
      getParams += 'last_updated=' + timestamp + '&'
    }

    setProfiles([])
    setParams(getParams)
  }

  const markerClicked = async profileUrl => {
    setPrimaryUrl('loading...')
    setTags('loading...')
    const res = await loadProfile(profileUrl)
    setPrimaryUrl(res?.primary_url)
    setTags(res?.tags)
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
          className="basis-1/12 flex justify-center items-center flex-col text-center md:flex-row md:justify-evenly md:px-96"
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
            <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                placeholder="primary_url"
                name="primary_url"
            />
          </div>
          <div>
            <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="last_updated search"
                type="datetime-local"
                name="last_updated"
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
                    {profiles?.map(profile => (
                      <Marker
                        key={profile[2]}
                        position={[
                          profile[1],
                          profile[0]
                        ]}
                        eventHandlers={{
                          click: async () => {
                            await markerClicked(profile[2])
                          },
                        }}
                      >
                        <Popup>primary_url: {primaryUrl}</Popup>
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
  const schemas = await loadSchemas()

  return {
    props: {
      schemas: schemas?.schema_list
    }
  }
}

import { lazy, useMemo } from 'react'
import { loadProfiles, loadSchemas } from '~/utils/loadData'
import { json } from '@remix-run/node'
import { useLoaderData, useRouteError, useSearchParams } from '@remix-run/react'
import leafletStyles from 'leaflet/dist/leaflet.css'
import leafletClusterStyles from '@changey/react-leaflet-markercluster/dist/styles.min.css'
import { ClientOnly } from 'remix-utils/client-only'
import HandleError from '~/components/HandleError'

export async function loader({ request }) {
  try {
    const url = new URL(request.url)
    const params = getParams(url.searchParams)
    const [schemas, profiles] = await Promise.all([
      loadSchemas(),
      loadProfiles(params)
    ])

    return json({
      schemas,
      profiles: profiles?.data,
      origin: url.origin
    })
  } catch (error) {
    throw new Response('Error loading data', { status: 500 })
  }
}

export default function Index() {
  const Map = lazy(() => import('~/components/map.client'))

  const { schemas, profiles, origin } = useLoaderData()
  const [searchParams] = useSearchParams()

  const formState = useMemo(
    () => ({
      schema: searchParams.get('schema') ?? 'organizations_schema-v1.0.0',
      name: searchParams.get('name') ?? '',
      tags: searchParams.get('tags') ?? '',
      primaryUrl: searchParams.get('primary_url') ?? '',
      lastUpdated: searchParams.get('last_updated')
        ? new Date(searchParams.get('last_updated') * 1000)
            .toISOString()
            .slice(0, -5)
        : ''
    }),
    [searchParams]
  )

  // leaflet parameters
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')
  const zoom = searchParams.get('zoom')
  const hideSearch = searchParams.get('hide_search')

  const handleSubmit = event => {
    event.preventDefault()
    const fields = ['schema', 'name', 'tags', 'primary_url', 'last_updated']
    let searchParams = new URLSearchParams('')

    fields.forEach(field => {
      const value = event?.target?.[field]?.value
      if (value) {
        if (field === 'last_updated') {
          searchParams.set(field, Date.parse(value) / 1000)
        } else {
          searchParams.set(field, value)
        }
      }
    })

    const getParameters = getParams(searchParams)
    window.location.search = '?' + getParameters
  }

  return (
    <div>
      <div className="flex h-screen flex-col">
        <div className="flex flex-col items-center md:flex-row">
          <div className="flex flex-auto flex-row items-center md:ml-2">
            <a
              className="flex flex-auto flex-row"
              href={
                hideSearch === 'true'
                  ? `${origin}?${searchParams
                      .toString()
                      .replace('hide_search=true', 'hide_search=false')}`
                  : `${origin}`
              }
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="/murmurations-logo.png"
                alt="Murmurations Map"
                width={40}
                height={40}
              />
              <h1 className="contents font-semibold md:hidden xl:contents">
                Murmurations Map
              </h1>
            </a>
          </div>
          {hideSearch === 'true' ? null : (
            <div className="flex-initial shrink">
              <form
                className="flex flex-col items-center justify-center text-center md:flex-row md:justify-evenly md:pr-16"
                onSubmit={handleSubmit}
              >
                <div className="py-1 md:px-1">
                  <select
                    className="focus:shadow-outline block w-full rounded border px-3 py-2 text-gray-700 focus:outline-none"
                    name="schema"
                    defaultValue={formState.schema}
                  >
                    {schemas
                      ?.filter(s => {
                        return !s.startsWith('test_schema-v')
                      })
                      .filter(s => {
                        return !s.startsWith('default-v')
                      })
                      .map(s => (
                        <option
                          className="mb-1 border-gray-50 px-2 py-0 text-sm"
                          value={s}
                          key={s}
                        >
                          {s}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="py-1 md:px-1">
                  <input
                    className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                    type="text"
                    placeholder="Name"
                    name="name"
                    defaultValue={formState.name}
                  />
                </div>
                <div className="py-1 md:px-1">
                  <input
                    className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                    type="text"
                    placeholder="Tags"
                    name="tags"
                    defaultValue={formState.tags}
                  />
                </div>
                <div className="py-1 md:px-1">
                  <input
                    className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                    type="text"
                    placeholder="primary_url"
                    name="primary_url"
                    defaultValue={formState.primaryUrl}
                  />
                </div>
                <div className="py-1 md:px-1">
                  <input
                    className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                    placeholder="last_updated search"
                    type="datetime-local"
                    name="last_updated"
                    defaultValue={formState.lastUpdated}
                  />
                </div>
                <div className="py-1 md:px-1">
                  <button
                    className="focus:shadow-outline rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700 focus:outline-none"
                    type="submit"
                    onClick={_ =>
                      window.goatcounter.count({
                        path: p => p + '?filter',
                        title: 'Map filter',
                        event: true
                      })
                    }
                  >
                    Filter
                  </button>
                </div>
              </form>
            </div>
          )}
          {hideSearch === 'true' ? null : (
            <div className="flex-end text-blue-500 md:mr-2">
              <a
                href="https://docs.murmurations.network/guides/map.html"
                target="_blank"
                rel="noreferrer"
                onClick={_ =>
                  window.goatcounter.count({
                    path: p => p + '?docs',
                    title: 'Map docs',
                    event: true
                  })
                }
              >
                Map Help
              </a>
            </div>
          )}
        </div>
        <div className="basis-11/12">
          {profiles?.length === 0 ? (
            <p className="text-center text-red-500">
              There were no results for your search query. Please try again with
              other search parameters.
            </p>
          ) : (
            ''
          )}
          <ClientOnly
            fallback={
              <h2 className="text-center">Map is loading and rendering...</h2>
            }
          >
            {() => <Map profiles={profiles} lat={lat} lon={lon} zoom={zoom} />}
          </ClientOnly>
        </div>
      </div>
    </div>
  )
}

export function links() {
  return [
    { rel: 'stylesheet', href: leafletStyles },
    { rel: 'stylesheet', href: leafletClusterStyles }
  ]
}

export function ErrorBoundary() {
  const error = useRouteError()
  return HandleError(error)
}

function getParams(searchParams) {
  const params = new URLSearchParams(searchParams)
  // issue-26 lat, lon, range
  if (!(params.get('lat') && params.get('lon') && params.get('range'))) {
    params.delete('lat')
    params.delete('lon')
    params.delete('range')
  }
  return params.toString()
}

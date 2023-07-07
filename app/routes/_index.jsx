import { lazy, useState } from 'react'
import { loadProfiles } from '~/utils/load-profiles'
import { loadSchemas } from '~/utils/load-schemas'
import { json } from '@remix-run/node'
import { useLoaderData, useRouteError, useSearchParams } from '@remix-run/react'
import leafletStyles from 'leaflet/dist/leaflet.css'
import leafletClusterStyles from '@changey/react-leaflet-markercluster/dist/styles.min.css'
import { ClientOnly } from 'remix-utils'
import HandleError from '~/components/HandleError'

export async function loader({ request }) {
  const schemas = await loadSchemas()
  const url = new URL(request.url)
  const params = getParams(url?.searchParams)
  const profiles = await loadProfiles(params)

  return json({
    schemas: schemas,
    profiles: profiles?.data,
    origin: url?.origin
  })
}

export default function Index() {
  const Map = lazy(() => import('~/components/map.client'))

  const loaderData = useLoaderData()
  const schemas = loaderData?.schemas ?? []
  const [searchParams] = useSearchParams()
  const schema = searchParams.get('schema')
  const name = searchParams.get('name')
  const tags = searchParams.get('tags')
  const primaryUrl = searchParams.get('primary_url')
  const lastUpdated = searchParams.get('last_updated')
    ? new Date(searchParams.get('last_updated') * 1000)
        .toISOString()
        .slice(0, -5)
    : null

  // leaflet parameters
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')
  const zoom = searchParams.get('zoom')
  const hideSearch = searchParams.get('hide_search')
  const origin = loaderData?.origin
  const [profiles] = useState(loaderData?.profiles)

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
                onSubmit={event => {
                  event.preventDefault()
                  let searchParams = new URLSearchParams('')
                  if (
                    event?.target?.schema?.value &&
                    event.target.schema.value !== ''
                  ) {
                    searchParams.set('schema', event.target.schema.value)
                  }
                  if (
                    event?.target?.name?.value &&
                    event.target.name.value !== ''
                  ) {
                    searchParams.set('name', event.target.name.value)
                  }
                  if (
                    event?.target?.tags?.value &&
                    event.target.tags.value !== ''
                  ) {
                    searchParams.set('tags', event.target.tags.value)
                  }
                  if (
                    event?.target?.primary_url?.value &&
                    event.target.primary_url.value !== ''
                  ) {
                    searchParams.set(
                      'primary_url',
                      event.target.primary_url.value
                    )
                  }
                  if (
                    event?.target?.last_updated?.value &&
                    event.target.last_updated.value !== ''
                  ) {
                    searchParams.set(
                      'last_updated',
                      Date.parse(event.target.last_updated.value) / 1000
                    )
                  }
                  const getParameters = getParams(searchParams)
                  window.location.href = '?' + getParameters
                }}
              >
                <div className="py-1 md:px-1">
                  <select
                    className="focus:shadow-outline block w-full rounded border px-3 py-2 text-gray-700 focus:outline-none"
                    name="schema"
                    defaultValue={
                      schema ? schema : 'organizations_schema-v1.0.0'
                    }
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
                    defaultValue={name}
                  />
                </div>
                <div className="py-1 md:px-1">
                  <input
                    className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                    type="text"
                    placeholder="Tags"
                    name="tags"
                    defaultValue={tags}
                  />
                </div>
                <div className="py-1 md:px-1">
                  <input
                    className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                    type="text"
                    placeholder="primary_url"
                    name="primary_url"
                    defaultValue={primaryUrl}
                  />
                </div>
                <div className="py-1 md:px-1">
                  <input
                    className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                    placeholder="last_updated search"
                    type="datetime-local"
                    name="last_updated"
                    defaultValue={lastUpdated}
                  />
                </div>
                <div className="py-1 md:px-1">
                  <button
                    className="focus:shadow-outline rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700 focus:outline-none"
                    type="submit"
                    onClick={e =>
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
                onClick={e =>
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
  let getParams = ''
  if (searchParams.get('schema')) {
    getParams += 'schema=' + searchParams.get('schema') + '&'
  }
  if (searchParams.get('name')) {
    getParams += 'name=' + searchParams.get('name') + '&'
  }
  if (searchParams.get('tags')) {
    getParams += 'tags=' + searchParams.get('tags') + '&'
  }
  if (searchParams.get('primary_url')) {
    getParams += 'primary_url=' + searchParams.get('primary_url') + '&'
  }
  if (searchParams.get('last_updated')) {
    getParams += 'last_updated=' + searchParams.get('last_updated') + '&'
  }
  if (
    searchParams.get('tags_exact') === 'true' ||
    searchParams.get('tags_exact') === 'false'
  ) {
    getParams += 'tags_exact=' + searchParams.get('tags_exact') + '&'
  }
  if (
    searchParams.get('tags_filter') === 'and' ||
    searchParams.get('tags_filter') === 'or'
  ) {
    getParams += 'tags_filter=' + searchParams.get('tags_filter') + '&'
  }
  // issue-26 lat, lon, range
  if (
    searchParams.get('lat') &&
    searchParams.get('lon') &&
    searchParams.get('range')
  ) {
    getParams +=
      'lat=' +
      searchParams.get('lat') +
      '&lon=' +
      searchParams.get('lon') +
      '&range=' +
      searchParams.get('range') +
      '&'
  }
  return getParams.slice(0, -1)
}

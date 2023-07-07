import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError
} from '@remix-run/react'

import styles from '~/styles/app.css'
import { json } from '@remix-run/node'

export const links = () => [{ rel: 'stylesheet', href: styles }]

export const meta = () => {
  return [
    { charset: 'utf-8' },
    { title: 'Murmurations Map' },
    { description: 'Murmurations - Making Movements Visible' },
    { viewport: 'width=device-width,initial-scale=1' }
  ]
}

export async function loader({ request }) {
  return json({
    ENV: {
      ALLOCATOR_URL: process.env.ALLOCATOR_URL
    },
    url: new URL(request.url)
  })
}

export default function App() {
  const data = useLoaderData()
  const production = !!data?.url?.match(/\/map/)
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <script
          data-goatcounter={
            production
              ? 'https://stats-map.murmurations.network/count'
              : 'https://test-stats-map.murmurations.network/count'
          }
          async
          src="//stats.murmurations.network/count.js"
        ></script>
        {production ? null : (
          <div className="flex flex-row justify-center bg-red-200 px-2 py-1 md:px-4 md:py-2">
            T E S T &nbsp; E N V I R O N M E N T
          </div>
        )}
        <Outlet />
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`
          }}
        />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  console.error(error)

  return (
    <html>
      <head>
        <title>Murmurations Map - Fatal Error</title>
        <Meta />
        <Links />
      </head>
      <body className="bg-white leading-normal text-black dark:bg-gray-900 dark:text-gray-50">
        <div className="container mx-auto flex h-screen flex-col items-center justify-center px-4">
          <span className="mb-8 text-5xl">💥😱</span>
          <h1 className="mb-8 text-xl font-bold">
            A fatal error has occurred and was logged.
          </h1>
          <code className="text-md">
            {error instanceof Error ? error.message : JSON.stringify(error)}
          </code>
        </div>
        <Scripts />
      </body>
    </html>
  )
}

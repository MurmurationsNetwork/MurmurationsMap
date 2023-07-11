import { isRouteErrorResponse } from '@remix-run/react'

export default function HandleError(error) {
  console.log(error)

  if (isRouteErrorResponse(error)) {
    return (
      <div className="container mx-auto flex h-screen flex-col items-center px-4">
        <span className="mb-8 text-5xl">🤬</span>
        <h1 className="mb-8 text-xl font-bold">{error.status} Error</h1>
        {error.statusText ? (
          <h2 className="mb-4 text-lg">{error.statusText}</h2>
        ) : null}
        <code className="text-md">{error.data}</code>
      </div>
    )
  } else {
    return (
      <div className="container mx-auto flex h-screen flex-col items-center px-4">
        <span className="mb-8 text-5xl">😱</span>
        <h1 className="mb-8 text-xl font-bold">
          A fatal error has occurred and was logged
        </h1>
        <code className="text-md">
          {error instanceof Error ? error.message : JSON.stringify(error)}
        </code>
      </div>
    )
  }
}

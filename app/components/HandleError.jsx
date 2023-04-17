import { isRouteErrorResponse } from "@remix-run/react";

export default function HandleError(error) {
  console.log(error);

  if (isRouteErrorResponse(error)) {
    return (
      <div className="container mx-auto px-4 h-screen flex items-center flex-col">
        <span className="text-5xl mb-8">🤬</span>
        <h1 className="text-xl font-bold mb-8">{error.status} Error</h1>
        {error.statusText ? (
          <h2 className="text-lg mb-4">{error.statusText}</h2>
        ) : null}
        <code className="text-md">{error.data}</code>
      </div>
    );
  } else {
    return (
      <div className="container mx-auto px-4 h-screen flex items-center flex-col">
        <span className="text-5xl mb-8">😱</span>
        <h1 className="text-xl font-bold mb-8">
          A fatal error has occurred and was logged
        </h1>
        <code className="text-md">
          {error instanceof Error ? error.message : JSON.stringify(error)}
        </code>
      </div>
    );
  }
}

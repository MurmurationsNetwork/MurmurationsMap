import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";

import styles from "~/styles/tailwind.css";
import { json } from "@remix-run/node";

export const links = () => [{ rel: "stylesheet", href: styles }];

export const meta = () => ({
  charset: "utf-8",
  title: "Murmurations Map",
  description: "Murmurations - Making Movements Visible",
  viewport: "width=device-width,initial-scale=1",
});

export async function loader({ request }) {
  return json({
    ENV: {
      API_URL: process.env.API_URL,
    },
    url: new URL(request.url),
  });
}

export default function App() {
  const data = useLoaderData();
  const production = !!data?.url?.match(/\/profiles/);
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <script
          data-goatcounter="https://murmurations.goatcounter.com/count"
          async
          src="//gc.zgo.at/count.js"
        ></script>{" "}
        {production ? null : (
          <div className="flex flex-row bg-red-200 py-1 px-2 md:py-2 md:px-4 justify-center">
            T E S T &nbsp; E N V I R O N M E N T
          </div>
        )}
        <Outlet />
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }) {
  console.error(error);
  return (
    <html>
      <head>
        <title>Murmurations Map - Fatal Error</title>
        <Meta />
        <Links />
      </head>
      <body className="bg-white dark:bg-gray-900 text-black dark:text-gray-50 leading-normal">
        <div className="container mx-auto px-4 h-screen flex justify-center items-center flex-col">
          <span className="text-5xl mb-8">💥😱</span>
          <h1 className="text-xl font-bold mb-8">
            A fatal error has occurred and was logged.
          </h1>
          <code className="text-lg">{error?.message}</code>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

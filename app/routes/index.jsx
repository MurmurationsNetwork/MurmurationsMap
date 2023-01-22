import { lazy, useState } from "react";
import { loadProfiles } from "~/utils/load-profiles";
import { loadSchemas } from "~/utils/load-schemas";
import { json } from "@remix-run/node";
import { useCatch, useLoaderData, useSearchParams } from "@remix-run/react";
import leafletStyles from "leaflet/dist/leaflet.css";
import leafletClusterStyles from "@changey/react-leaflet-markercluster/dist/styles.min.css";
import { ClientOnly } from "remix-utils";

export async function loader({ request }) {
  const schemas = await loadSchemas();
  const url = new URL(request.url);
  const params = getParams(url?.searchParams);
  const profiles = await loadProfiles(params);

  return json({
    schemas: schemas,
    profiles: profiles?.data,
  });
}

export default function Index() {
  const Map = lazy(() => import("~/components/map.client"));

  const loaderData = useLoaderData();
  const schemas = loaderData?.schemas ? loaderData.schemas.schema_list : [];
  const [searchParams] = useSearchParams();
  const schema = searchParams.get("schema");
  const tags = searchParams.get("tags");
  const primaryUrl = searchParams.get("primary_url");
  const lastUpdated = searchParams.get("last_updated")
    ? new Date(searchParams.get("last_updated") * 1000)
        .toISOString()
        .slice(0, -5)
    : null;

  // leaflet parameters
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const zoom = searchParams.get("zoom");

  const [profiles] = useState(loaderData?.profiles);

  return (
    <div>
      <div className="flex flex-col h-screen">
        <div className="flex flex-col md:flex-row items-center">
          <div className="flex-auto flex flex-row items-center">
            <img
              src="/murmurations-logo.png"
              alt="Murmurations Map"
              width={50}
              height={50}
            />
            <h1 className="contents md:hidden xl:contents font-semibold">
              Murmurations Map
            </h1>
          </div>
          <div className="flex-initial shrink">
            <form
              className="flex justify-center items-center flex-col text-center md:flex-row md:justify-evenly md:pr-16"
              onSubmit={(event) => {
                event.preventDefault();
                let searchParams = new URLSearchParams("");
                if (
                  event?.target?.schema?.value &&
                  event.target.schema.value !== ""
                ) {
                  searchParams.set("schema", event.target.schema.value);
                }
                if (
                  event?.target?.tags?.value &&
                  event.target.tags.value !== ""
                ) {
                  searchParams.set("tags", event.target.tags.value);
                }
                if (
                  event?.target?.primary_url?.value &&
                  event.target.primary_url.value !== ""
                ) {
                  searchParams.set(
                    "primary_url",
                    event.target.primary_url.value
                  );
                }
                if (
                  event?.target?.last_updated?.value &&
                  event.target.last_updated.value !== ""
                ) {
                  searchParams.set(
                    "last_updated",
                    Date.parse(event.target.last_updated.value) / 1000
                  );
                }
                const getParameters = getParams(searchParams);
                window.location.href = "?" + getParameters;
              }}
            >
              <div className="py-1 md:px-1">
                <select
                  className="border rounded block w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
                  name="schema"
                  defaultValue={schema}
                >
                  <option value="">All schemas</option>
                  {schemas
                    ?.filter((s) => {
                      return !s.startsWith("test_schema-v");
                    })
                    .filter((s) => {
                      return !s.startsWith("default-v");
                    })
                    .map((s) => (
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
              <div className="py-1 md:px-1">
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="text"
                  placeholder="Tags"
                  name="tags"
                  defaultValue={tags}
                />
              </div>
              <div className="py-1 md:px-1">
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="text"
                  placeholder="primary_url"
                  name="primary_url"
                  defaultValue={primaryUrl}
                />
              </div>
              <div className="py-1 md:px-1">
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="last_updated search"
                  type="datetime-local"
                  name="last_updated"
                  defaultValue={lastUpdated}
                />
              </div>
              <div className="py-1 md:px-1">
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="submit"
                >
                  Filter
                </button>
              </div>
            </form>
          </div>
          <div className="flex-auto text-blue-500">
            <a
              href="https://docs.murmurations.network/guides/map.html"
              target="_blank"
              rel="noreferrer"
            >
              Map Help
            </a>
          </div>
        </div>
        <div className="basis-11/12">
          {profiles?.length === 0 ? (
            <p className="text-center text-red-500">
              There were no results for your search query. Please try again with
              other search parameters.
            </p>
          ) : (
            ""
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
  );
}

export function links() {
  return [
    { rel: "stylesheet", href: leafletStyles },
    { rel: "stylesheet", href: leafletClusterStyles },
  ];
}

export function CatchBoundary() {
  const caught = useCatch();
  console.error(caught);
  return (
    <div className="container mx-auto px-4 h-screen flex items-center flex-col">
      <span className="text-5xl mb-8">💥🤬</span>
      <h1 className="text-xl font-bold mb-8">An error has occurred</h1>
      <h2 className="text-lg mb-4">
        {caught.status} - {caught.statusText}
      </h2>
      <code className="text-md">{caught.data}</code>
    </div>
  );
}

function getParams(searchParams) {
  let getParams = "";
  if (searchParams.get("schema")) {
    getParams += "schema=" + searchParams.get("schema") + "&";
  }
  if (searchParams.get("tags")) {
    getParams += "tags=" + searchParams.get("tags") + "&";
  }
  if (searchParams.get("primary_url")) {
    getParams += "primary_url=" + searchParams.get("primary_url") + "&";
  }
  if (searchParams.get("last_updated")) {
    getParams += "last_updated=" + searchParams.get("last_updated") + "&";
  }
  if (
    searchParams.get("tags_exact") === "true" ||
    searchParams.get("tags_exact") === "false"
  ) {
    getParams += "tags_exact=" + searchParams.get("tags_exact") + "&";
  }
  if (
    searchParams.get("tags_filter") === "and" ||
    searchParams.get("tags_filter") === "or"
  ) {
    getParams += "tags_filter=" + searchParams.get("tags_filter") + "&";
  }
  return getParams.slice(0, -1);
}

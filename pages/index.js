import Head from "next/head";
import Map from "../components/map";

const DEFAULT_CENTER = [48.864716, 2.349014];

export default function Home() {
  return (
    <div>
      <Head>
        <title>Murmurations Map</title>
        <meta name="description" content="Murmurations Map" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col">
        <Map className="w-full h-screen" center={DEFAULT_CENTER} zoom={12}>
          {({ TileLayer, Marker, Popup }) => (
            <>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={DEFAULT_CENTER}>
                <Popup>
                  Murmurations Map Capital <br /> Paris, France
                </Popup>
              </Marker>
            </>
          )}
        </Map>
      </div>
    </div>
  );
}

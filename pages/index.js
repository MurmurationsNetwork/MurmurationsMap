import Head from 'next/head'
import Map from '../components/map'
import { getProfiles } from '../libs/profile'

const DEFAULT_CENTER = [48.864716, 2.349014]

export default function Home({ profiles }) {
  return (
    <div>
      <Head>
        <title>Murmurations Map</title>
        <meta name="description" content="Murmurations Map" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col">
        <Map className="w-full h-screen" center={DEFAULT_CENTER} zoom={4}>
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
  )
}

export async function getServerSideProps() {
  const profiles = await getProfiles()

  return { props: JSON.parse(JSON.stringify(profiles)) }
}

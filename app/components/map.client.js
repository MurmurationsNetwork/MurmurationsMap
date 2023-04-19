import L from "leaflet";
import * as ReactLeaflet from "react-leaflet";
import MarkerClusterGroup from "@changey/react-leaflet-markercluster";

import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import { loadProfile } from "~/utils/load-profiles";
import { useEffect } from "react";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: iconUrl,
  iconRetinaUrl: iconRetinaUrl,
  shadowUrl: shadowUrl,
});

const markerClicked = async (profileUrl) => {
  return await loadProfile(profileUrl);
};

const MapClient = ({ profiles, lat, lon, zoom }) => {
  let defaultCenter = [];
  defaultCenter[0] = parseFloat(lat) || 48.864716;
  defaultCenter[1] = parseFloat(lon) || 2.349014;
  let defaultZoom = parseInt(zoom) || 4;

  useEffect(() => {
    (async function init() {
      delete L.Icon.Default.prototype._getIconUrl;
    })();
  }, []);

  return (
    <ReactLeaflet.MapContainer
      className="h-full w-full"
      center={defaultCenter}
      zoom={defaultZoom}
    >
      <ReactLeaflet.TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      <MarkerClusterGroup>
        {profiles?.map((profile) => (
          <ReactLeaflet.Marker
            key={profile[2]}
            position={[profile[1], profile[0]]}
            eventHandlers={{
              click: async (event) => {
                const data = await markerClicked(profile[2]);
                let popupInfo = event.target.getPopup();
                let content = "";
                if (data?.primary_url) {
                  content +=
                    "<p>URL: <a target='_blank' rel='noreferrer' href='https://" +
                    data.primary_url +
                    "'>" +
                    data.primary_url +
                    "</a></p>";
                }
                if (data?.tags) {
                  // content += '<p>tags: ' + data.tags + '</p>'
                  content += '<div>Tags:</div><div class="flex flex-wrap">';
                  for (let i = 0; i < data.tags.length; i++) {
                    content += `<span class="bg-red-500 text-white font-bold py-1 px-2 m-1 rounded">${data.tags[i]}</span>`;
                  }
                  content += "</div>";
                }
                if (data?.profile_url) {
                  content +=
                    "<p class='truncate'>Source: <a target='_blank' rel='noreferrer' href='" +
                    data.profile_url +
                    "'>" +
                    data.profile_url +
                    "</a></p>";
                }
                popupInfo.setContent(content);
              },
            }}
          >
            <ReactLeaflet.Popup></ReactLeaflet.Popup>
          </ReactLeaflet.Marker>
        ))}
      </MarkerClusterGroup>
    </ReactLeaflet.MapContainer>
  );
};

export default MapClient;

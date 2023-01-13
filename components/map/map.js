import { useEffect } from 'react'
import L from 'leaflet'
import * as ReactLeaflet from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import MarkerClusterGroup from '@changey/react-leaflet-markercluster'
import '@changey/react-leaflet-markercluster/dist/styles.min.css'

import styles from './map.module.css'

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

const Map = ({ children, className, ...rest }) => {
  let mapClassName = styles.map

  if (className) {
    mapClassName = `${mapClassName} ${className}`
  }

  useEffect(() => {
    ;(async function init() {
      delete L.Icon.Default.prototype._getIconUrl

      L.Icon.Default.mergeOptions({
        iconRetinaUrl: iconRetinaUrl.src,
        iconUrl: iconUrl.src,
        shadowUrl: shadowUrl.src
      })
    })()
  }, [])

  return (
    <ReactLeaflet.MapContainer className={mapClassName} {...rest}>
      {children(
        ReactLeaflet.TileLayer,
        ReactLeaflet.Marker,
        ReactLeaflet.Popup,
        MarkerClusterGroup
      )}
    </ReactLeaflet.MapContainer>
  )
}

export default Map

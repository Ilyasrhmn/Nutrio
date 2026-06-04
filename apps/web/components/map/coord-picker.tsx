"use client"

import * as React from "react"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix default Leaflet icon in webpack/Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

interface CoordPickerProps {
  lat: number | null
  lng: number | null
  onChange: (lat: number, lng: number) => void
}

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export function CoordPicker({ lat, lng, onChange }: CoordPickerProps) {
  const center: [number, number] = lat !== null && lng !== null
    ? [lat, lng]
    : [-7.5, 110.0]

  return (
    <MapContainer
      center={center}
      zoom={lat !== null ? 13 : 6}
      scrollWheelZoom
      style={{ width: "100%", height: "100%", borderRadius: "inherit" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onChange={onChange} />
      {lat !== null && lng !== null && (
        <Marker
          position={[lat, lng]}
          draggable
          eventHandlers={{
            dragend(e) {
              const m = e.target as L.Marker
              const p = m.getLatLng()
              onChange(p.lat, p.lng)
            },
          }}
        />
      )}
    </MapContainer>
  )
}

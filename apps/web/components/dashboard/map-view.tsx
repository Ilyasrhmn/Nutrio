"use client"

import React, { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix leafet default icon issue in Next.js
const customIcon = (color: string) => {
  return new L.DivIcon({
    className: "custom-leaflet-icon",
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

interface Vendor {
  id: number
  name: string
  location: string
  status: string
  variant: string
  capacity: string
  lat: number
  lng: number
  color: string
}

export default function MapView({ vendors }: { vendors: Vendor[] }) {
  // Custom icon used for all markers, so we don't need to mutate L.Icon.Default

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer 
        center={[-7.7656, 110.3725]} 
        zoom={12} 
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <ZoomControl position="topright" />
        
        {vendors.map(vendor => (
          <Marker 
            key={vendor.id} 
            position={[vendor.lat, vendor.lng]}
            icon={customIcon(vendor.color)}
          >
            <Popup className="rounded-xl overflow-hidden shadow-xl border-0">
              <div className="p-1 min-w-[200px]">
                <p className="font-bold text-slate-900 text-sm mb-1">{vendor.name}</p>
                <p className="text-xs text-slate-500 mb-2">{vendor.location}</p>
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-400 uppercase">Kapasitas</span>
                  <span className="text-indigo-600">{vendor.capacity}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                  <span style={{ color: vendor.color }} className="text-[10px] font-black uppercase">{vendor.status}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

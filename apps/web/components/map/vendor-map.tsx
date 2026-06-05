"use client"

import * as React from "react"
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { cn } from "@workspace/ui/lib/utils"

// Fix default icon path issue in webpack/Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

// City fallback coordinates for Indonesian cities
const CITY_COORDS: Record<string, [number, number]> = {
  "jakarta": [-6.2088, 106.8456],
  "jakarta pusat": [-6.1944, 106.8229],
  "jakarta selatan": [-6.2607, 106.8106],
  "jakarta utara": [-6.1382, 106.8614],
  "jakarta barat": [-6.1675, 106.7644],
  "jakarta timur": [-6.2251, 106.9004],
  "bandung": [-6.9175, 107.6191],
  "surabaya": [-7.2575, 112.7521],
  "yogyakarta": [-7.7956, 110.3695],
  "semarang": [-6.9932, 110.4203],
  "medan": [3.5952, 98.6722],
  "pontianak": [-0.0263, 109.3425],
  "makassar": [-5.1477, 119.4327],
  "depok": [-6.4025, 106.7942],
  "tangerang": [-6.1783, 106.6319],
  "bekasi": [-6.2349, 106.9896],
  "bogor": [-6.5944, 106.7892],
  "palembang": [-2.9761, 104.7754],
  "pekanbaru": [0.5071, 101.4478],
  "balikpapan": [-1.2675, 116.8289],
  "samarinda": [-0.5022, 117.1536],
  "sleman": [-7.7173, 110.3564],
  "bantul": [-7.8881, 110.3167],
  "malang": [-7.9666, 112.6326],
}

function getCoordsForVendor(vendor: VendorPin): [number, number] | null {
  if (vendor.lat !== null && vendor.lng !== null) {
    return [vendor.lat, vendor.lng]
  }
  const city = (vendor.addressCity ?? "").toLowerCase()
  return CITY_COORDS[city] ?? null
}

function scoreColor(score: number): string {
  if (score >= 80) return "#10b981"
  if (score >= 60) return "#f59e0b"
  return "#ef4444"
}

function makeIcon(score: number) {
  const color = scoreColor(score)
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 36px; height: 36px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -38],
  })
}

export interface VendorPin {
  id: string
  name: string
  addressCity: string
  addressProvince: string
  score: number
  targetPorsi: number
  schoolCount: number
  lat: number | null
  lng: number | null
}

interface VendorMapProps {
  vendors: VendorPin[]
  className?: string
  onVendorClick?: (vendor: VendorPin) => void
}

export function VendorMap({ vendors, className, onVendorClick }: VendorMapProps) {
  const pins = vendors
    .map((v) => ({ vendor: v, coords: getCoordsForVendor(v) }))
    .filter((p): p is { vendor: VendorPin; coords: [number, number] } => p.coords !== null)

  // Center on Indonesia / Java
  const center: [number, number] = pins.length > 0 ? pins[0]!.coords : [-7.5, 110.0]

  return (
    <div className={cn("w-full h-full", className)}>
      <MapContainer
        center={center}
        zoom={8}
        scrollWheelZoom
        zoomControl={false}
        style={{ width: "100%", height: "100%", borderRadius: "inherit" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />

        {pins.map(({ vendor, coords }) => (
          <Marker
            key={vendor.id}
            position={coords}
            icon={makeIcon(vendor.score)}
            eventHandlers={{
              click: () => onVendorClick?.(vendor),
            }}
          >
            <Popup>
              <div className="text-sm space-y-1 min-w-[160px]">
                <p className="font-bold text-slate-900 leading-tight">{vendor.name}</p>
                <p className="text-slate-500 text-xs">{vendor.addressCity}, {vendor.addressProvince}</p>
                <div className="flex items-center justify-between pt-1 border-t mt-1">
                  <span className="text-xs font-bold" style={{ color: scoreColor(vendor.score) }}>
                    Skor {vendor.score}
                  </span>
                  <span className="text-xs text-slate-400">{vendor.targetPorsi} porsi</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

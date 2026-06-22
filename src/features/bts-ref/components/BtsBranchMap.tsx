import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { BtsBranch } from '../types'
import type { UserLocation } from '../hooks/useUserLocation'
import { parseLatLong } from '../utils/parseLatLong'

// Pure SVG pins (no external .png assets, so nothing can fail to load).
const pinSvg = (fill: string, w: number, h: number) =>
  `<svg width="${w}" height="${h}" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 8.5 12 24 12 24s12-15.5 12-24C24 5.373 18.627 0 12 0z"
      fill="${fill}" stroke="#ffffff" stroke-width="2"/>
    <circle cx="12" cy="12" r="4.5" fill="#ffffff"/>
  </svg>`

// Passing a custom className replaces Leaflet's default `.leaflet-div-icon`
// white box, leaving just the SVG pin.
const makeIcon = (fill: string, w: number, h: number) =>
  L.divIcon({
    className: 'bts-pin',
    html: pinSvg(fill, w, h),
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
    popupAnchor: [0, -h + 4],
    tooltipAnchor: [0, -h + 6],
  })

const defaultIcon = makeIcon('#2563eb', 26, 38)
const selectedIcon = makeIcon('#dc2626', 32, 46)

// "You are here" dot for the user's geolocation.
const userIcon = L.divIcon({
  className: 'bts-user',
  html: `<span style="display:block;width:16px;height:16px;border-radius:50%;
    background:#16a34a;border:3px solid #fff;box-shadow:0 0 0 2px #16a34a;"></span>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  tooltipAnchor: [0, -10],
})

// Tashkent fallback center.
const FALLBACK_CENTER: [number, number] = [41.3111, 69.2797]

type BranchPoint = { branch: BtsBranch; lat: number; lng: number }

// Fit the map to the branches only (not the user's location, which may be far away).
function fitToBranches(map: L.Map, points: BranchPoint[]) {
  if (points.length === 0) return
  const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]))
  map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
}

type MapViewControllerProps = {
  points: BranchPoint[]
  selectedCode: string | null
}

// Imperatively adjusts the map view: fit the branches initially, then fly to selection.
function MapViewController({ points, selectedCode }: MapViewControllerProps) {
  const map = useMap()

  useEffect(() => {
    fitToBranches(map, points)
  }, [map, points])

  useEffect(() => {
    if (!selectedCode) return
    const target = points.find((p) => p.branch.code === selectedCode)
    if (!target) return

    // Shift the centre up so the marker sits in the lower half, leaving room for
    // the info popup (which opens upward) instead of clipping it off the top.
    const targetZoom = Math.max(map.getZoom(), 14)
    const markerPoint = map.project([target.lat, target.lng], targetZoom)
    const center = map.unproject(markerPoint.subtract([0, 90]), targetZoom)
    map.flyTo(center, targetZoom, { duration: 0.6 })
  }, [map, points, selectedCode])

  return null
}

// Clicking the empty map, or closing the info popup with its "x", zooms back out
// to show all branches of the current filter.
function MapClickReset({ points }: { points: BranchPoint[] }) {
  useMapEvents({
    click: (e) => fitToBranches(e.target as L.Map, points),
    popupclose: (e) => fitToBranches(e.target as L.Map, points),
  })
  return null
}

export type BtsBranchMapProps = {
  branches: BtsBranch[]
  selectedCode: string | null
  onSelectCode: (code: string) => void
  userLocation?: UserLocation | null
  className?: string
}

export function BtsBranchMap({ branches, selectedCode, onSelectCode, userLocation, className }: BtsBranchMapProps) {
  const { t } = useTranslation()
  const points = useMemo<BranchPoint[]>(() => {
    return branches
      .map((branch) => {
        const coords = parseLatLong(branch.latLong)
        return coords ? { branch, lat: coords.lat, lng: coords.lng } : null
      })
      .filter((p): p is BranchPoint => p !== null)
  }, [branches])

  const initialCenter = points.length > 0 ? ([points[0].lat, points[0].lng] as [number, number]) : FALLBACK_CENTER

  return (
    <MapContainer
      center={initialCenter}
      zoom={12}
      scrollWheelZoom={false}
      className={className ?? 'h-72 w-full rounded-lg overflow-hidden z-0'}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {points.map(({ branch, lat, lng }) => {
        const isSelected = branch.code === selectedCode
        return (
          <Marker
            key={branch.code}
            position={[lat, lng]}
            icon={isSelected ? selectedIcon : defaultIcon}
            zIndexOffset={isSelected ? 1000 : 0}
            eventHandlers={{ click: () => onSelectCode(branch.code) }}
          >
            {/* Permanent name label on every branch; the selected one is emphasised. */}
            <Tooltip
              permanent
              direction="top"
              opacity={1}
              className={isSelected ? 'bts-tip bts-tip--selected' : 'bts-tip'}
            >
              {branch.name}
            </Tooltip>
            <Popup>
              <div className="space-y-0.5">
                <p className="font-semibold">{branch.name}</p>
                <p className="text-xs">{branch.address}</p>
                {branch.phone && <p className="text-xs">{branch.phone}</p>}
              </div>
            </Popup>
          </Marker>
        )
      })}

      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} zIndexOffset={500}>
          <Tooltip direction="top" opacity={1} className="bts-tip">
            {t('checkout.yourLocation')}
          </Tooltip>
        </Marker>
      )}

      <MapViewController points={points} selectedCode={selectedCode} />
      <MapClickReset points={points} />
    </MapContainer>
  )
}

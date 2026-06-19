export type LatLng = { lat: number; lng: number }

/**
 * Parses a BTS "lat,long" string (e.g. "41.311081,69.240562") into coordinates.
 * Returns null when the value is missing or malformed.
 */
export function parseLatLong(latLong?: string | null): LatLng | null {
  if (!latLong) return null

  const parts = latLong.split(',').map((p) => Number(p.trim()))
  if (parts.length !== 2) return null

  const [lat, lng] = parts
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null

  return { lat, lng }
}

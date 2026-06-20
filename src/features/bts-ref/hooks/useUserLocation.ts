import { useEffect, useState } from 'react'

export type UserLocation = { lat: number; lng: number }

/**
 * Requests the browser geolocation once `enabled` turns true (e.g. after a city
 * is selected). Returns the user's coordinates so the map can show where they
 * are relative to the BTS branches.
 */
export function useUserLocation(enabled: boolean) {
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || location) return
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setError('unsupported')
      return
    }

    let cancelled = false
    setLoading(true)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLoading(false)
      },
      (err) => {
        if (cancelled) return
        setError(err.message)
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )

    return () => {
      cancelled = true
    }
  }, [enabled, location])

  return { location, loading, error }
}

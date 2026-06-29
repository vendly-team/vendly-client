import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import { LatLng } from 'leaflet'
import L from 'leaflet'
import { ChevronLeft, Loader2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddressForm } from '@/features/addresses'
import type { CreateAddressRequest } from '@/features/addresses'
import { toast } from 'sonner'

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface ReverseGeocodeResult {
  address: {
    city?: string
    region?: string
    county?: string
    road?: string
    house_number?: string
  }
}

type MapAddressPickerProps = {
  onAddressSelected: (request: CreateAddressRequest) => Promise<any>
}

const MapPicker = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e: any) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

const MapPopup = ({ geocodeData }: { geocodeData: ReverseGeocodeResult | null }) => {
  if (!geocodeData) return null
  const addr = geocodeData.address
  const displayName = `${addr.road || ''}${addr.house_number ? ' ' + addr.house_number : ''}, ${addr.city || addr.region || ''}`
  return <div className="text-[12px] text-foreground">{displayName}</div>
}

interface SimpleAddressFormProps {
  initialData?: {
    label: string
    city: string
    district: string
    street: string
    house: string
  }
  onSubmit: (request: CreateAddressRequest) => Promise<any>
  loading?: boolean
  submitLabel?: string
}

const SimpleAddressForm = ({ initialData, onSubmit, loading = false, submitLabel }: SimpleAddressFormProps) => {
  const { t } = useTranslation()
  const [label, setLabel] = useState(initialData?.label || '')
  const [street, setStreet] = useState(initialData?.street || '')
  const [house, setHouse] = useState(initialData?.house || '')
  const [extra, setExtra] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!label.trim()) newErrors.label = t('checkout.errors.labelRequired')
    if (!street.trim()) newErrors.street = t('checkout.errors.streetRequired')
    if (!house.trim()) newErrors.house = t('checkout.errors.houseRequired', { defaultValue: 'House is required' })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Use fake BTS codes for map-based addresses (user didn't select from BTS)
    const request: CreateAddressRequest = {
      label,
      street,
      house,
      city: initialData?.city || '',
      district: initialData?.district || '',
      extra: extra || null,
      btsCityCode: 'MAP',
      btsBranchCode: null,
      isDefault: false,
    }

    await onSubmit(request)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[13px] font-semibold tracking-[-0.006em] text-foreground mb-2">
          {t('checkout.label')}
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => {
            setLabel(e.target.value)
            if (errors.label) setErrors({ ...errors, label: '' })
          }}
          placeholder={t('checkout.defaultLabel')}
          className="w-full h-10 px-3 border border-border rounded-lg bg-background text-[14px] focus:outline-none focus:ring-2 focus:ring-accent/25"
        />
        {errors.label && <p className="text-[12px] text-destructive mt-1">{errors.label}</p>}
      </div>

      <div>
        <label className="block text-[13px] font-semibold tracking-[-0.006em] text-foreground mb-2">
          {t('checkout.street')}
        </label>
        <input
          type="text"
          value={street}
          onChange={(e) => {
            setStreet(e.target.value)
            if (errors.street) setErrors({ ...errors, street: '' })
          }}
          className="w-full h-10 px-3 border border-border rounded-lg bg-background text-[14px] focus:outline-none focus:ring-2 focus:ring-accent/25"
        />
        {errors.street && <p className="text-[12px] text-destructive mt-1">{errors.street}</p>}
      </div>

      <div>
        <label className="block text-[13px] font-semibold tracking-[-0.006em] text-foreground mb-2">
          {t('checkout.house')}
        </label>
        <input
          type="text"
          value={house}
          onChange={(e) => {
            setHouse(e.target.value)
            if (errors.house) setErrors({ ...errors, house: '' })
          }}
          className="w-full h-10 px-3 border border-border rounded-lg bg-background text-[14px] focus:outline-none focus:ring-2 focus:ring-accent/25"
        />
        {errors.house && <p className="text-[12px] text-destructive mt-1">{errors.house}</p>}
      </div>

      <div>
        <label className="block text-[13px] font-semibold tracking-[-0.006em] text-foreground mb-2">
          {t('checkout.notes')}
        </label>
        <textarea
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
          placeholder={t('checkout.notesPlaceholder', { defaultValue: 'Apartment, floor, entrance, etc.' })}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-[14px] focus:outline-none focus:ring-2 focus:ring-accent/25 resize-none"
          rows={3}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full h-11">
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          submitLabel || t('common.save')
        )}
      </Button>
    </form>
  )
}

export function MapAddressPicker({ onAddressSelected }: MapAddressPickerProps) {
  const { t } = useTranslation()
  const defaultPosition: [number, number] = [41.2995, 69.2401] // Tashkent center
  const [position, setPosition] = useState<[number, number]>(defaultPosition)
  const [geocodeData, setGeocodeData] = useState<ReverseGeocodeResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Initial reverse geocode when component mounts
  useEffect(() => {
    reverseGeocode(defaultPosition[0], defaultPosition[1])
  }, [])

  const reverseGeocode = async (lat: number, lng: number) => {
    setLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      )
      const data = await response.json()
      setGeocodeData(data)
      setPosition([lat, lng])
    } catch (error) {
      toast.error(t('checkout.geocodeFailed', { defaultValue: 'Could not get address' }))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAddress = async (request: CreateAddressRequest) => {
    setSubmitting(true)
    try {
      await onAddressSelected(request)
      setShowForm(false)
      setPosition(null)
      setGeocodeData(null)
      toast.success(t('checkout.addressSaved', { defaultValue: 'Address saved' }))
    } catch {
      toast.error(t('checkout.addressSaveFailed', { defaultValue: 'Failed to save address' }))
    } finally {
      setSubmitting(false)
    }
  }

  if (showForm && geocodeData) {
    const geocodedAddress = {
      label: geocodeData.address.road || 'Home',
      city: geocodeData.address.city || geocodeData.address.region || '',
      district: geocodeData.address.county || '',
      street: geocodeData.address.road || '',
      house: geocodeData.address.house_number || '',
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold tracking-[-0.011em] text-foreground">
            {t('checkout.confirmAddress', { defaultValue: 'Confirm address' })}
          </h3>
          <button
            type="button"
            onClick={() => {
              setShowForm(false)
            }}
            className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Geocoded address preview */}
        <div className="bg-card border border-border rounded-lg p-3 space-y-1">
          <p className="text-[12px] font-semibold tracking-[-0.005em] text-muted-foreground uppercase">
            {t('checkout.detectedAddress', { defaultValue: 'Detected address' })}
          </p>
          <p className="text-[13px] font-normal text-foreground">
            {geocodedAddress.street && `${geocodedAddress.street}${geocodedAddress.house ? ', ' + geocodedAddress.house : ''}`}
          </p>
          <p className="text-[13px] font-normal text-muted-foreground">
            {geocodedAddress.city}
            {geocodedAddress.district && `, ${geocodedAddress.district}`}
          </p>
        </div>

        <SimpleAddressForm
          initialData={geocodedAddress}
          onSubmit={handleSubmitAddress}
          loading={submitting}
          submitLabel={t('common.save')}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPin size={16} className="text-accent" />
        <h3 className="text-[15px] font-semibold tracking-[-0.011em] text-foreground">
          {t('checkout.selectLocationOnMap', { defaultValue: 'Select location on map' })}
        </h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96 border border-border rounded-lg bg-card">
          <Loader2 size={24} className="text-accent animate-spin" />
        </div>
      ) : (
        <div className="h-96 border border-border rounded-lg overflow-hidden">
          <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <MapPicker onLocationSelect={reverseGeocode} />
            {position && (
              <Marker position={position}>
                {geocodeData && (
                  <Popup>
                    <div className="text-[12px] whitespace-nowrap">
                      {`${geocodeData.address.road || ''}${geocodeData.address.house_number ? ' ' + geocodeData.address.house_number : ''}, ${geocodeData.address.city || geocodeData.address.region || ''}`}
                    </div>
                  </Popup>
                )}
              </Marker>
            )}
          </MapContainer>
        </div>
      )}

      <p className="text-[12px] font-normal tracking-[-0.003em] text-muted-foreground">
        {t('checkout.mapHint', { defaultValue: 'Click on the map to select your delivery location' })}
      </p>
    </div>
  )
}

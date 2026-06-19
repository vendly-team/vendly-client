import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useBtsBranches } from '../hooks/useBtsBranches'
import { useUserLocation } from '../hooks/useUserLocation'
import { BtsBranchMap } from './BtsBranchMap'

export type BtsBranchPickerProps = {
  regionCode: string | null
  cityCode: string | null
  value: string | null
  onChange: (code: string) => void
  label?: string
}

/**
 * Branch picker for the checkout address section.
 * Once a city is selected it shows the BTS branches of that city; if the city
 * itself has none, it falls back to every branch in the city's region. The
 * branches are shown on an OpenStreetMap and in a dropdown, and the user's own
 * location is requested and pinned on the map. Selecting a branch in either the
 * dropdown or by clicking its marker keeps both in sync and highlights it.
 */
export function BtsBranchPicker({ regionCode, cityCode, value, onChange, label }: BtsBranchPickerProps) {
  const { t } = useTranslation()
  const { branches, loading, error } = useBtsBranches(regionCode)
  const { location: userLocation } = useUserLocation(!!cityCode)

  // Prefer branches in the selected district; fall back to the whole region.
  const visibleBranches = useMemo(() => {
    if (!cityCode) return branches
    const inCity = branches.filter((b) => b.cityCode === cityCode)
    return inCity.length > 0 ? inCity : branches
  }, [branches, cityCode])

  if (!cityCode) return null

  return (
    <div className="space-y-2">
      <p className="text-[13px] font-medium tracking-[-0.006em]">
        {label ?? t('checkout.branch')}
      </p>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      ) : error ? (
        <p className="text-[13px] text-destructive">{t('checkout.errors.branchesFailed')}</p>
      ) : visibleBranches.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">{t('checkout.noBranches')}</p>
      ) : (
        <>
          <Select value={value || undefined} onValueChange={onChange}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder={t('checkout.selectBranch')} />
            </SelectTrigger>
            <SelectContent>
              {visibleBranches.map((b) => (
                <SelectItem key={b.code} value={b.code}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <BtsBranchMap
            branches={visibleBranches}
            selectedCode={value}
            onSelectCode={onChange}
            userLocation={userLocation}
          />
        </>
      )}
    </div>
  )
}

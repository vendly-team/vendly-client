import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useBtsRegions, useBtsCities } from '@/features/bts-ref'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import type { Address, CreateAddressRequest } from '../types'

type AddressFormValues = {
  label: string
  btsRegionCode: string
  btsCityCode: string
  street: string
  house: string
  extra?: string
  isDefault: boolean
}

export type AddressFormProps = {
  initialAddress?: Address | null
  submitLabel?: string
  onSubmit: (request: CreateAddressRequest) => void | Promise<void>
  loading?: boolean
}

const buildSchema = (t: (key: string) => string) =>
  z.object({
    label: z.string().min(1, t('checkout.errors.labelRequired')).max(50),
    btsRegionCode: z.string().min(1, t('checkout.errors.regionRequired')),
    btsCityCode: z.string().min(1, t('checkout.errors.cityRequired')),
    street: z.string().min(1, t('checkout.errors.streetRequired')).max(255),
    house: z.string().min(1, t('checkout.errors.houseRequired')).max(50),
    extra: z.string().max(255).optional(),
    isDefault: z.boolean(),
  })

export function AddressForm({
  initialAddress,
  submitLabel,
  onSubmit,
  loading = false,
}: AddressFormProps) {
  const { t } = useTranslation()
  const { regions, loading: regionsLoading } = useBtsRegions()

  const schema = useMemo(() => buildSchema(t), [t])

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: initialAddress?.label ?? t('checkout.defaultLabel'),
      btsRegionCode: '',
      btsCityCode: initialAddress?.btsCityCode ?? '',
      street: initialAddress?.street ?? '',
      house: initialAddress?.house ?? '',
      extra: initialAddress?.extra ?? '',
      isDefault: initialAddress?.isDefault ?? false,
    },
  })

  const watchedRegionCode = form.watch('btsRegionCode')
  const { cities, loading: citiesLoading } = useBtsCities(watchedRegionCode || null)

  // When editing, derive region from initial city's region code once cities load
  useEffect(() => {
    if (!initialAddress || regions.length === 0) return
    // try to find the region by matching initial btsCityCode prefix in regions list
    // simplest: scan regions and let cities hook resolve by region; we set the
    // first 2 chars of city code as a heuristic, since BTS codes use that pattern.
    if (form.getValues('btsRegionCode')) return
    const guessedRegionCode = initialAddress.btsCityCode.substring(0, 2)
    const matchingRegion = regions.find((r) => r.code === guessedRegionCode)
    if (matchingRegion) {
      form.setValue('btsRegionCode', matchingRegion.code)
    }
  }, [initialAddress, regions, form])

  const handleSubmit = form.handleSubmit(async (values) => {
    const region = regions.find((r) => r.code === values.btsRegionCode)
    const city = cities.find((c) => c.code === values.btsCityCode)
    if (!region || !city) return

    const payload: CreateAddressRequest = {
      label: values.label,
      city: region.name,
      district: city.name,
      street: values.street,
      house: values.house,
      extra: values.extra?.trim() ? values.extra.trim() : null,
      btsCityCode: city.code,
      isDefault: values.isDefault,
    }

    await onSubmit(payload)
  })

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-medium tracking-[-0.006em]">
                {t('checkout.label')}
              </FormLabel>
              <FormControl>
                <Input className="h-11" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="btsRegionCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-medium tracking-[-0.006em]">
                  {t('checkout.region')} *
                </FormLabel>
                <Select
                  value={field.value || undefined}
                  onValueChange={(v) => {
                    field.onChange(v)
                    // Reset city when region changes
                    form.setValue('btsCityCode', '')
                  }}
                  disabled={regionsLoading}
                >
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder={t('checkout.selectRegion')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {regions.map((r) => (
                      <SelectItem key={r.code} value={r.code}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="btsCityCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-medium tracking-[-0.006em]">
                  {t('checkout.city')} *
                </FormLabel>
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  disabled={!watchedRegionCode || citiesLoading}
                >
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue
                        placeholder={
                          watchedRegionCode
                            ? t('checkout.selectCity')
                            : t('checkout.selectRegionFirst')
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cities.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="street"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-medium tracking-[-0.006em]">
                  {t('checkout.street')} *
                </FormLabel>
                <FormControl>
                  <Input className="h-11" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="house"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-medium tracking-[-0.006em]">
                  {t('checkout.house')} *
                </FormLabel>
                <FormControl>
                  <Input className="h-11" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="extra"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-medium tracking-[-0.006em]">
                {t('checkout.notes')}
              </FormLabel>
              <FormControl>
                <Textarea className="min-h-20 resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isDefault"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="text-[14px] font-medium tracking-[-0.011em] cursor-pointer">
                {t('checkout.saveAsDefault')}
              </FormLabel>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full h-11" disabled={loading}>
          {submitLabel ?? t('common.continue')}
        </Button>
      </form>
    </Form>
  )
}

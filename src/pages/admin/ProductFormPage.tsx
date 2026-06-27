import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  ArrowLeft,
  CheckCircle2,
  ImagePlus,
  Info,
  Layers,
  Package,
  Plus,
  RefreshCw,
  Save,
  Tag,
  Trash2,
  Wand2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { productService } from '@/features/products/services/productService'
import type { ProductAdminDetailResponse, SyncSource } from '@/features/products/types'
import { pickLanguageString } from '@/features/products/types'
import { API_BASE_URL } from '@/shared/api/http'

type VariantRowState = {
  name: string
  price: string
  quantity: string
  isActive: boolean
  image: File | null
  saving: boolean
}

type CategoryItem = {
  id: number
  // Backend MultiLanguageField sifatida qaytaradi; pickLanguageString bilan oddiy stringga aylantiramiz.
  name: string | { uz?: string | null; ru?: string | null; en?: string | null; cyrl?: string | null }
}

type InfoFormState = {
  categoryId: string
  name: string
  description: string
  syncSource: SyncSource
  isActive: boolean
}

const emptyInfoForm: InfoFormState = {
  categoryId: '',
  name: '',
  description: '',
  syncSource: 0,
  isActive: true,
}

const steps = [
  { id: 1, titleKey: 'products.steps.infoTitle', titleDefault: 'Product info', descriptionKey: 'products.steps.infoDescription', descriptionDefault: 'Main product fields' },
  { id: 2, titleKey: 'products.steps.variantsTitle', titleDefault: 'Variants', descriptionKey: 'products.steps.variantsDescription', descriptionDefault: 'Types and options' },
  { id: 3, titleKey: 'products.steps.skuTitle', titleDefault: 'SKU data', descriptionKey: 'products.steps.skuDescription', descriptionDefault: 'Price, stock, images' },
] as const

const guideMockImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='520' height='520' viewBox='0 0 520 520'%3E%3Crect width='520' height='520' rx='36' fill='%23f1f5f9'/%3E%3Crect x='156' y='52' width='208' height='416' rx='38' fill='%23111827'/%3E%3Crect x='174' y='74' width='172' height='372' rx='28' fill='%23f8fafc'/%3E%3Cpath d='M174 190c48-32 99-27 172 4v252H174z' fill='%23fee2e2'/%3E%3Cpath d='M174 253c55-44 113-28 172 10v183H174z' fill='%23fed7aa'/%3E%3Ccircle cx='302' cy='122' r='31' fill='%23111827'/%3E%3Ccircle cx='226' cy='122' r='31' fill='%23111827'/%3E%3Ccircle cx='302' cy='122' r='18' fill='%2364748b'/%3E%3Ccircle cx='226' cy='122' r='18' fill='%2364748b'/%3E%3Crect x='214' y='318' width='92' height='18' rx='9' fill='%23111827'/%3E%3Crect x='198' y='348' width='124' height='12' rx='6' fill='%23111827' opacity='.45'/%3E%3C/svg%3E"

type PreviewSection =
  | 'image'
  | 'category'
  | 'name'
  | 'description'
  | 'badges'
  | 'variants'
  | 'skuPrice'
  | 'skuStock'
  | null

const toVariantRows = (product: ProductAdminDetailResponse) => {
  const rows: Record<number, VariantRowState> = {}

  product.variants.forEach(variant => {
    const combinationName = variant.combination.map(item => item.optionName).join(' / ')

    rows[variant.id] = {
      name: variant.name?.trim() || combinationName || 'Default SKU',
      price: variant.price != null ? String(variant.price) : '0',
      quantity: variant.quantity != null ? String(variant.quantity) : '0',
      isActive: Boolean(variant.isActive),
      image: null,
      saving: false,
    }
  })

  return rows
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 0 }).format(value)

const resolveMediaUrl = (url?: string | null) => {
  if (!url) return null
  if (/^https?:\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`
}

const getVariantLabel = (variant: ProductAdminDetailResponse['variants'][number]) =>
  variant.combination.length > 0
    ? variant.combination.map(item => item.optionName).join(' / ')
    : variant.name ?? 'Default'

type ImagePickerProps = {
  label: string
  fileName?: string | null
  previewUrl?: string | null
  compact?: boolean
  onSelect: (file: File) => void
  onFocus?: () => void
  onBlur?: () => void
}

const getImageFromClipboard = (items: DataTransferItemList) => {
  for (const item of Array.from(items)) {
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      return item.getAsFile()
    }
  }

  return null
}

const ImagePicker = ({ label, fileName, previewUrl, compact = false, onSelect, onFocus, onBlur }: ImagePickerProps) => {
  const handleFiles = (files: FileList | null) => {
    const file = files?.[0]
    if (file && file.type.startsWith('image/')) onSelect(file)
  }

  return (
    <label
      className={`group flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-background px-3 text-sm text-muted-foreground transition-colors hover:border-accent/60 hover:bg-accent/5 hover:text-foreground focus-within:border-accent/60 ${compact ? 'h-9 text-xs' : 'h-11'}`}
      onDragOver={event => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'copy'
      }}
      onDrop={event => {
        event.preventDefault()
        handleFiles(event.dataTransfer.files)
      }}
      onPaste={event => {
        const file = getImageFromClipboard(event.clipboardData.items)
        if (file) {
          event.preventDefault()
          onSelect(file)
        }
      }}
      tabIndex={0}
      onFocus={onFocus}
      onBlur={onBlur}
      title={label}
    >
      {previewUrl ? (
        <img src={previewUrl} alt="" className={`${compact ? 'h-6 w-6' : 'h-7 w-7'} shrink-0 rounded object-contain`} />
      ) : (
        <ImagePlus size={compact ? 14 : 16} className="shrink-0 transition-colors group-hover:text-accent" />
      )}
      <span className="truncate">{fileName ?? label}</span>
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={event => handleFiles(event.target.files)}
      />
    </label>
  )
}

export function ProductFormPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const productId = id ? Number(id) : null

  const [product, setProduct] = useState<ProductAdminDetailResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [savingInfo, setSavingInfo] = useState(false)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1)
  const [infoForm, setInfoForm] = useState<InfoFormState>(emptyInfoForm)

  const [newTypeName, setNewTypeName] = useState('')
  const [addingType, setAddingType] = useState(false)

  const [optionInputs, setOptionInputs] = useState<Record<number, { name: string; file: File | null }>>({})
  const [addingOption, setAddingOption] = useState<Record<number, boolean>>({})

  const [variantRows, setVariantRows] = useState<Record<number, VariantRowState>>({})
  const [regenerating, setRegenerating] = useState(false)
  const [savingAllVariants, setSavingAllVariants] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [guideStep, setGuideStep] = useState<1 | 2 | 3>(1)
  const [previewPanelSize, setPreviewPanelSize] = useState(50)
  const [previewHighlight, setPreviewHighlight] = useState<PreviewSection>(null)

  const [categories, setCategories] = useState<CategoryItem[]>([])

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then(response => response.json())
      .then((data: CategoryItem[]) => setCategories(data))
      .catch(() => setCategories([]))
  }, [])

  const fetchProduct = async (pid: number) => {
    setLoading(true)
    try {
      const data = await productService.getById(pid)
      setProduct(data)
      setInfoForm({
        categoryId: String(data.categoryId),
        // Backend MultiLanguageField (uz/ru/en/cyrl) qaytaradi — formda string sifatida ishlatamiz.
        name: pickLanguageString(data.name),
        description: data.description ?? '',
        syncSource: data.syncSource,
        isActive: data.isActive,
      })
      setVariantRows(toVariantRows(data))
      if (data.variants.length > 0) setActiveStep(3)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('products.errors.loadFailed', { defaultValue: 'Failed to load product' }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (productId) void fetchProduct(productId)
  }, [productId])

  const selectedCategory = useMemo(
    () => categories.find(category => String(category.id) === infoForm.categoryId),
    [categories, infoForm.categoryId],
  )

  const previewPrice = useMemo(() => {
    const prices = Object.values(variantRows)
      .map(row => Number(row.price))
      .filter(price => Number.isFinite(price) && price > 0)

    return prices.length > 0 ? Math.min(...prices) : 0
  }, [variantRows])

  const previewImage = useMemo(() => {
    const variantWithImage = product?.variants.find(variant => variant.images.length > 0)
    const optionWithImage = product?.variantTypes.flatMap(type => type.options).find(option => option.imageUrl)
    return resolveMediaUrl(variantWithImage?.images[0]) ?? resolveMediaUrl(optionWithImage?.imageUrl)
  }, [product])

  const validateInfo = () => {
    if (!infoForm.name.trim()) {
      toast.error(t('products.errors.nameRequired', { defaultValue: 'Product name is required' }))
      return false
    }

    if (!infoForm.categoryId) {
      toast.error(t('products.errors.categoryRequired', { defaultValue: 'Category is required' }))
      return false
    }

    return true
  }

  const handleSaveInfo = async () => {
    if (!validateInfo()) return

    setSavingInfo(true)
    try {
      if (productId && product) {
        await productService.update(productId, {
          categoryId: Number(infoForm.categoryId),
          name: infoForm.name.trim(),
          description: infoForm.description.trim() || null,
          isActive: infoForm.isActive,
          syncSource: infoForm.syncSource,
        })
        await fetchProduct(productId)
        toast.success(t('products.success.saved', { defaultValue: 'Product saved' }))
      } else {
        const newId = await productService.create({
          categoryId: Number(infoForm.categoryId),
          name: infoForm.name.trim(),
          description: infoForm.description.trim() || undefined,
          syncSource: infoForm.syncSource,
        })
        toast.success(t('products.success.createdNext', { defaultValue: 'Product created. Add variant types and options next.' }))
        setActiveStep(2)
        navigate(`/admin/products/${newId}/edit`, { replace: true })
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('products.errors.saveFailed', { defaultValue: 'Failed to save product' }))
    } finally {
      setSavingInfo(false)
    }
  }

  const handleAddType = async () => {
    if (!productId || !newTypeName.trim()) return

    setAddingType(true)
    try {
      await productService.addVariantType(productId, {
        name: newTypeName.trim(),
        displayOrder: (product?.variantTypes.length ?? 0) + 1,
      })
      setNewTypeName('')
      await fetchProduct(productId)
      toast.success(t('products.success.variantTypeAdded', { defaultValue: 'Variant type added' }))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('products.errors.addVariantTypeFailed', { defaultValue: 'Failed to add variant type' }))
    } finally {
      setAddingType(false)
    }
  }

  const handleDeleteType = async (typeId: number) => {
    if (!productId) return

    try {
      await productService.deleteVariantType(typeId)
      await fetchProduct(productId)
      toast.success(t('products.success.variantTypeDeleted', { defaultValue: 'Variant type deleted' }))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('products.errors.deleteVariantTypeFailed', { defaultValue: 'Failed to delete variant type' }))
    }
  }

  const handleAddOption = async (typeId: number) => {
    if (!productId) return

    const input = optionInputs[typeId]
    if (!input?.name.trim()) return

    const type = product?.variantTypes.find(item => item.id === typeId)

    setAddingOption(previous => ({ ...previous, [typeId]: true }))
    try {
      await productService.addVariantOption(typeId, {
        name: input.name.trim(),
        image: input.file ?? undefined,
        displayOrder: (type?.options.length ?? 0) + 1,
      })
      setOptionInputs(previous => ({ ...previous, [typeId]: { name: '', file: null } }))
      await fetchProduct(productId)
      toast.success(t('products.success.variantOptionAdded', { defaultValue: 'Variant option added' }))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('products.errors.addVariantOptionFailed', { defaultValue: 'Failed to add variant option' }))
    } finally {
      setAddingOption(previous => ({ ...previous, [typeId]: false }))
    }
  }

  const handleDeleteOption = async (optionId: number) => {
    if (!productId) return

    try {
      await productService.deleteVariantOption(optionId)
      await fetchProduct(productId)
      toast.success(t('products.success.variantOptionDeleted', { defaultValue: 'Variant option deleted' }))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('products.errors.deleteVariantOptionFailed', { defaultValue: 'Failed to delete variant option' }))
    }
  }

  const handleRegenerate = async () => {
    if (!productId) return

    setRegenerating(true)
    try {
      await productService.regenerateVariants(productId)
      await fetchProduct(productId)
      toast.success(t('products.success.skuGenerated', { defaultValue: 'SKU combinations generated' }))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('products.errors.refreshCombinationsFailed', { defaultValue: 'Failed to refresh combinations' }))
    } finally {
      setRegenerating(false)
    }
  }

  const updateVariantRow = (variantId: number, patch: Partial<VariantRowState>) => {
    setVariantRows(previous => ({
      ...previous,
      [variantId]: { ...previous[variantId], ...patch },
    }))
  }

  const handleSaveVariant = async (variantId: number) => {
    if (!productId) return

    const row = variantRows[variantId]
    if (!row) return

    updateVariantRow(variantId, { saving: true })
    try {
      await productService.updateVariant(variantId, {
        name: row.name.trim() || undefined,
        price: Number(row.price),
        quantity: Number(row.quantity),
        isActive: row.isActive,
        image: row.image ?? undefined,
      })
      await fetchProduct(productId)
      toast.success(t('products.success.skuUpdated', { defaultValue: 'SKU updated' }))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('products.errors.updateSkuFailed', { defaultValue: 'Failed to update SKU' }))
    } finally {
      updateVariantRow(variantId, { saving: false })
    }
  }

  const handleSaveAllVariants = async () => {
    if (!productId || !product || product.variants.length === 0) return

    const invalidRow = product.variants.find(variant => {
      const row = variantRows[variant.id]
      return !row || Number(row.price) < 0 || Number(row.quantity) < 0 || Number.isNaN(Number(row.price)) || Number.isNaN(Number(row.quantity))
    })

    if (invalidRow) {
      toast.error(t('products.errors.validSkuNumbers', { defaultValue: 'Price and stock must be valid positive numbers' }))
      return
    }

    const saveRowsIndividually = async () => {
      await Promise.all(product.variants.map(variant => {
        const row = variantRows[variant.id]
        return productService.updateVariant(variant.id, {
          name: row.name.trim() || undefined,
          price: Number(row.price),
          quantity: Number(row.quantity),
          isActive: row.isActive,
          image: row.image ?? undefined,
        })
      }))
    }

    setSavingAllVariants(true)
    try {
      await productService.bulkUpdateVariants(productId, {
        variants: product.variants.map(variant => {
          const row = variantRows[variant.id]
          return {
            id: variant.id,
            name: row.name.trim() || null,
            price: Number(row.price),
            quantity: Number(row.quantity),
            isActive: row.isActive,
          }
        }),
      })

      const rowsWithImages = product.variants.filter(variant => variantRows[variant.id]?.image)

      await Promise.all(rowsWithImages.map(variant => {
        const row = variantRows[variant.id]
        return productService.updateVariant(variant.id, {
          name: row.name.trim() || undefined,
          price: Number(row.price),
          quantity: Number(row.quantity),
          isActive: row.isActive,
          image: row.image ?? undefined,
        })
      }))

      await fetchProduct(productId)
      toast.success(t('products.success.allSkuSaved', { defaultValue: 'All SKU data saved' }))
    } catch (error) {
      const message = error instanceof Error ? error.message : t('products.errors.saveSkuFailed', { defaultValue: 'Failed to save SKU data' })

      if (message.includes('404')) {
        try {
          await saveRowsIndividually()
          await fetchProduct(productId)
          toast.success(t('products.success.allSkuSaved', { defaultValue: 'All SKU data saved' }))
        } catch (fallbackError) {
          toast.error(fallbackError instanceof Error ? fallbackError.message : t('products.errors.saveSkuFailed', { defaultValue: 'Failed to save SKU data' }))
        }
      } else {
        toast.error(message)
      }
    } finally {
      setSavingAllVariants(false)
    }
  }

  const canManageVariants = Boolean(productId && product)
  const canOpenStep = (step: 1 | 2 | 3) => step === 1 || canManageVariants
  const previewIsHorizontal = previewPanelSize >= 40
  const creationGuideSteps = [
    {
      number: 1,
      title: t('products.guide.step1Title', { defaultValue: 'Fill product basics' }),
      description: t('products.guide.step1Description', { defaultValue: 'Write a clear product name, choose the right category, add the buyer-facing description, then save to unlock variants.' }),
    },
    {
      number: 2,
      title: t('products.guide.step2Title', { defaultValue: 'Add variant types and options' }),
      description: t('products.guide.step2Description', { defaultValue: 'Create types like Color, Model, or Size. Add every option customers should be able to select, with option images when useful.' }),
    },
    {
      number: 3,
      title: t('products.guide.step3Title', { defaultValue: 'Generate and complete SKUs' }),
      description: t('products.guide.step3Description', { defaultValue: 'Refresh SKU combinations, then set each SKU name, price, quantity, active status, and primary image before saving.' }),
    },
  ]
  const mockHighlightClass = (step: 1 | 2 | 3) =>
    guideStep === step ? 'ring-2 ring-accent ring-offset-2 ring-offset-card shadow-[0_0_0_6px_hsl(var(--accent)/0.12)]' : 'ring-1 ring-border/70'
  const previewHighlightClass = (section: Exclude<PreviewSection, null>) =>
    previewHighlight === section ? 'ring-2 ring-accent ring-offset-2 ring-offset-card shadow-[0_0_0_6px_hsl(var(--accent)/0.12)]' : 'ring-0'
  const openGuide = (step: 1 | 2 | 3) => {
    setGuideStep(step)
    setGuideOpen(true)
  }

  if (loading && !product) {
    return <div className="flex h-64 items-center justify-center text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">{t('products.loadingDetail', { defaultValue: 'Loading product detail...' })}</div>
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate('/admin/products')} aria-label={t('common.back', { defaultValue: 'Back' })}>
            <ArrowLeft size={18} />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display">
                {isEdit ? t('products.editProduct') : t('products.newProduct')}
              </h1>
              <Badge variant={infoForm.isActive ? 'default' : 'secondary'} className="shrink-0">
                {infoForm.isActive ? t('common.active', { defaultValue: 'Active' }) : t('common.inactive', { defaultValue: 'Inactive' })}
              </Badge>
            </div>
            <p className="text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">
              {t('products.formSubtitle', { defaultValue: 'Product data, variant options, SKU combinations, and storefront preview.' })}
            </p>
          </div>
        </div>

        <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full" aria-label={t('products.guide.open', { defaultValue: 'Product creation guide' })} onClick={() => setGuideStep(activeStep)}>
              <Info size={18} />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>{t('products.guide.title', { defaultValue: 'How to create a product correctly' })}</DialogTitle>
              <DialogDescription>
                {t('products.guide.subtitle', { defaultValue: 'Follow this flow so the storefront card, variant selectors, price, stock, and images all work together.' })}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <div className="relative grid gap-3 md:grid-cols-3">
                <div className="absolute left-0 right-0 top-6 hidden h-px bg-border md:block" />
                {creationGuideSteps.map(item => (
                  <button
                    key={item.number}
                    type="button"
                    onClick={() => setGuideStep(item.number as 1 | 2 | 3)}
                    className={`relative z-10 flex min-h-32 w-full gap-3 rounded-lg border p-4 text-left transition-all ${guideStep === item.number
                      ? 'border-accent bg-accent/10 shadow-sm'
                      : 'border-border bg-card hover:border-accent/40 hover:bg-muted/40'
                      }`}
                  >
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${guideStep === item.number
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-background text-muted-foreground ring-1 ring-border'
                      }`}>
                      {item.number}
                    </span>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{t('products.guide.mockupTitle', { defaultValue: 'Expected result' })}</span>
                  <Badge variant="outline">{t('products.skuData', { defaultValue: 'SKU data' })}</Badge>
                </div>
                <div className="grid overflow-hidden rounded-lg border border-border bg-card md:grid-cols-[220px_minmax(0,1fr)]">
                  <div className={`grid min-h-64 place-items-center bg-muted transition-all ${mockHighlightClass(3)}`}>
                    <img src={guideMockImage} alt="" className="h-full w-full object-contain p-4" />
                  </div>
                  <div className="space-y-3 p-4">
                    <div className={`rounded-lg border bg-background p-3 transition-all ${mockHighlightClass(1)}`}>
                      <span className="mb-2 inline-flex rounded bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">{t('products.guide.mockupInfoLabel', { defaultValue: '1 · Product info' })}</span>
                      <p className="text-xs text-muted-foreground">{t('products.guide.mockupCategory', { defaultValue: 'Phone cases' })}</p>
                      <h3 className="mt-1 text-lg font-display font-bold leading-tight text-foreground">
                        {t('products.guide.mockupProductName', { defaultValue: 'iPhone 15 Pro Max protective case' })}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {t('products.guide.mockupDescription', { defaultValue: 'Soft silicone case with camera protection. Clear title and description become the storefront text.' })}
                      </p>
                    </div>
                    <div className={`rounded-lg border bg-background p-3 transition-all ${mockHighlightClass(2)}`}>
                      <span className="mb-2 inline-flex rounded bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">{t('products.guide.mockupVariantsLabel', { defaultValue: '2 · Variants' })}</span>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-md border border-accent bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">{t('products.guide.mockupOptionColor', { defaultValue: 'Color: Black' })}</span>
                        <span className="rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground">{t('products.guide.mockupOptionModel', { defaultValue: 'Model: 15 Pro Max' })}</span>
                        <span className="rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground">{t('products.guide.mockupOptionSize', { defaultValue: 'Size: Slim' })}</span>
                      </div>
                    </div>
                    <div className={`rounded-lg border bg-accent/10 p-3 transition-all ${mockHighlightClass(3)}`}>
                      <span className="mb-2 inline-flex rounded bg-background/80 px-2 py-0.5 text-[11px] font-semibold text-accent">{t('products.guide.mockupSkuLabel', { defaultValue: '3 · SKU' })}</span>
                      <p className="text-xs font-medium text-accent">{t('products.guide.mockupPriceLabel', { defaultValue: 'SKU price and stock are visible' })}</p>
                      <p className="mt-1 text-xl font-bold text-accent">
                        156 800 so'm
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="default">{t('common.active')}</Badge>
                        <Badge variant="outline">{t('products.manual')}</Badge>
                        <Badge variant="outline">8 {t('products.sku')}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-sm">
        <div className="relative grid gap-2 md:grid-cols-3">
          <div className="absolute left-0 right-0 top-1/2 hidden h-px -translate-y-1/2 bg-border md:block" />
          {steps.map(step => {
            const isActive = activeStep === step.id
            const enabled = canOpenStep(step.id)
            const isComplete = canManageVariants && step.id < activeStep

            return (
              <button
                key={step.id}
                type="button"
                disabled={!enabled}
                onClick={() => setActiveStep(step.id)}
                className={`relative z-10 flex min-h-12 items-center gap-2 rounded-lg border px-3 text-left transition-all ${isActive
                  ? 'border-accent bg-accent/10 text-foreground shadow-md shadow-accent/10'
                  : enabled
                    ? 'border-border bg-card text-foreground hover:border-accent/40 hover:bg-muted/40'
                    : 'cursor-not-allowed border-border bg-muted/40 text-muted-foreground/50'
                  }`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${isActive
                  ? 'bg-accent text-accent-foreground'
                  : isComplete
                    ? 'bg-success/10 text-success'
                    : 'bg-muted text-muted-foreground'
                  }`}>
                  {isComplete ? <CheckCircle2 size={16} /> : step.id}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-medium tracking-[-0.011em]">
                    {t(step.titleKey, { defaultValue: step.titleDefault })}
                    {step.id === 3 && product?.variants.length ? ` (${product.variants.length})` : ''}
                  </span>
                  <span className="hidden truncate text-[11px] font-normal tracking-[-0.003em] text-muted-foreground sm:block">
                    {t(step.descriptionKey, { defaultValue: step.descriptionDefault })}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="min-h-[720px] gap-1">
        <ResizablePanel defaultSize={50} minSize={35} className="min-w-0">
          <div className="min-w-0 space-y-5 pr-2">
            {activeStep === 1 && <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3 text-[18px] font-semibold tracking-[-0.016em] leading-[1.2]">
                  <span className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">1</span>
                    {t('products.productInformation')}
                  </span>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => openGuide(1)} aria-label={t('products.guide.open', { defaultValue: 'Product creation guide' })}>
                    <Info size={15} />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2 lg:col-span-1">
                  <Label htmlFor="product-name">{t('common.product')} *</Label>
                  <Input
                    id="product-name"
                    value={infoForm.name}
                    onFocus={() => setPreviewHighlight('name')}
                    onBlur={() => setPreviewHighlight(null)}
                    onChange={event => setInfoForm(previous => ({ ...previous, name: event.target.value }))}
                    placeholder={t('products.namePlaceholder', { defaultValue: 'iPhone chexol 11, 12, 13...' })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('common.category')} *</Label>
                  <Select
                    value={infoForm.categoryId}
                    onValueChange={value => setInfoForm(previous => ({ ...previous, categoryId: value }))}
                  >
                    <SelectTrigger onFocus={() => setPreviewHighlight('category')} onBlur={() => setPreviewHighlight(null)}>
                      <SelectValue placeholder={t('products.selectCategory', { defaultValue: 'Select category' })} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          {pickLanguageString(category.name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 lg:col-span-1">
                  <Label htmlFor="product-description">{t('products.description')}</Label>
                  <Textarea
                    id="product-description"
                    value={infoForm.description}
                    onFocus={() => setPreviewHighlight('description')}
                    onBlur={() => setPreviewHighlight(null)}
                    onChange={event => setInfoForm(previous => ({ ...previous, description: event.target.value }))}
                    placeholder={t('products.descriptionPlaceholder', { defaultValue: 'Short product description for storefront.' })}
                    className="min-h-[118px]"
                  />
                </div>

                <div className="grid content-start gap-4">
                  <div className="space-y-2">
                    <Label>{t('products.source')}</Label>
                    <Select
                      value={String(infoForm.syncSource)}
                      onValueChange={value => setInfoForm(previous => ({ ...previous, syncSource: Number(value) as SyncSource }))}
                    >
                      <SelectTrigger onFocus={() => setPreviewHighlight('badges')} onBlur={() => setPreviewHighlight(null)}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">{t('products.manual', { defaultValue: 'Manual' })}</SelectItem>
                        <SelectItem value="1">{t('products.external', { defaultValue: 'External' })}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex h-11 items-center justify-between rounded-lg border border-border bg-card px-4">
                    <div>
                      <Label className="text-[13px] font-medium tracking-[-0.006em]">{t('products.activeProduct', { defaultValue: 'Active product' })}</Label>
                      <p className="text-[12px] font-normal tracking-[-0.003em] text-muted-foreground">{t('products.activeProductHint', { defaultValue: 'Visible in storefront when active.' })}</p>
                    </div>
                    <Switch
                      checked={infoForm.isActive}
                      onCheckedChange={checked => setInfoForm(previous => ({ ...previous, isActive: checked }))}
                      onFocus={() => setPreviewHighlight('badges')}
                      onBlur={() => setPreviewHighlight(null)}
                      disabled={!isEdit}
                    />
                  </div>
                </div>
              </CardContent>
              <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
                <Button onClick={handleSaveInfo} disabled={savingInfo}>
                  <Save size={16} className="mr-2" />
                  {savingInfo ? t('common.saving', { defaultValue: 'Saving...' }) : isEdit ? t('products.saveProductInfo', { defaultValue: 'Save product info' }) : t('products.saveAndContinue', { defaultValue: 'Save and continue' })}
                </Button>
                <Button
                  variant="outline"
                  disabled={!canManageVariants}
                  onClick={() => setActiveStep(2)}
                >
                  {t('common.next', { defaultValue: 'Next' })}
                </Button>
              </div>
            </Card>}

            {activeStep === 2 && <Card className={!canManageVariants ? 'opacity-75' : undefined}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3 text-[18px] font-semibold tracking-[-0.016em] leading-[1.2]">
                  <span className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">2</span>
                    {t('products.variantTypes', { defaultValue: 'Variant types' })}
                  </span>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => openGuide(2)} aria-label={t('products.guide.open', { defaultValue: 'Product creation guide' })}>
                    <Info size={15} />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!canManageVariants && (
                  <div className="rounded-lg border border-dashed border-border bg-muted/35 p-4 text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">
                    {t('products.saveInfoFirstHint', { defaultValue: 'Save product information first, then add variant types like Color, Model, or Size.' })}
                  </div>
                )}

                {product?.variantTypes.map(type => (
                  <div key={type.id} className="rounded-lg border border-border bg-card p-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <Layers size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-semibold tracking-[-0.011em] text-foreground">{type.name}</p>
                        <p className="text-[12px] font-normal tracking-[-0.003em] text-muted-foreground">
                          {t('products.optionCountDisplayOrder', { count: type.options.length, order: type.displayOrder ?? '-', defaultValue: '{{count}} option · Display order {{order}}' })}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteType(type.id)}>
                        <Trash2 size={15} />
                      </Button>
                    </div>

                    <div className="mt-3 grid gap-2">
                      {type.options.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {type.options.map(option => (
                            <div key={option.id} className="flex h-8 items-center gap-2 rounded-full border border-border bg-background pl-2 pr-1 text-[12px] font-medium tracking-[-0.003em]">
                              {option.imageUrl ? (
                                <img src={resolveMediaUrl(option.imageUrl) ?? ''} alt={option.name} className="h-5 w-5 rounded-full object-contain" />
                              ) : (
                                <span className="h-5 w-5 rounded-full bg-muted" />
                              )}
                              <span>{option.name}</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteOption(option.id)}
                                className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                aria-label={t('products.deleteOption', { defaultValue: 'Delete option' })}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_220px_40px]">
                        <Input
                          placeholder={t('products.addOptionPlaceholder', { type: type.name.toLowerCase(), defaultValue: 'Add {{type}} option' })}
                          value={optionInputs[type.id]?.name ?? ''}
                          onFocus={() => setPreviewHighlight('variants')}
                          onBlur={() => setPreviewHighlight(null)}
                          onChange={event =>
                            setOptionInputs(previous => ({
                              ...previous,
                              [type.id]: { name: event.target.value, file: previous[type.id]?.file ?? null },
                            }))
                          }
                          onKeyDown={event => {
                            if (event.key === 'Enter') void handleAddOption(type.id)
                          }}
                        />
                        <ImagePicker
                          label={t('products.optionImage', { defaultValue: 'Option image' })}
                          fileName={optionInputs[type.id]?.file?.name}
                          onFocus={() => setPreviewHighlight('variants')}
                          onBlur={() => setPreviewHighlight(null)}
                          onSelect={file =>
                            setOptionInputs(previous => ({
                              ...previous,
                              [type.id]: { name: previous[type.id]?.name ?? '', file },
                            }))
                          }
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          disabled={addingOption[type.id] || !optionInputs[type.id]?.name.trim()}
                          onClick={() => handleAddOption(type.id)}
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
                  <Input
                    placeholder={t('products.newVariantTypePlaceholder', { defaultValue: 'New variant type, e.g. Color' })}
                    value={newTypeName}
                    disabled={!canManageVariants}
                    onFocus={() => setPreviewHighlight('variants')}
                    onBlur={() => setPreviewHighlight(null)}
                    onChange={event => setNewTypeName(event.target.value)}
                    onKeyDown={event => {
                      if (event.key === 'Enter') void handleAddType()
                    }}
                  />
                  <Button onClick={handleAddType} disabled={!canManageVariants || addingType || !newTypeName.trim()}>
                    <Plus size={16} className="mr-2" />
                    {t('products.addType', { defaultValue: 'Add type' })}
                  </Button>
                </div>
              </CardContent>
              <div className="flex justify-between gap-2 border-t border-border px-6 py-4">
                <Button variant="outline" onClick={() => setActiveStep(1)}>{t('common.back', { defaultValue: 'Back' })}</Button>
                <Button onClick={() => setActiveStep(3)} disabled={!canManageVariants}>
                  {t('products.continueToSkuData', { defaultValue: 'Continue to SKU data' })}
                </Button>
              </div>
            </Card>}

            {activeStep === 3 && <Card className={!canManageVariants ? 'opacity-75' : undefined}>
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center justify-between gap-3 text-[18px] font-semibold tracking-[-0.016em] leading-[1.2]">
                  <span className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">3</span>
                    {t('products.skuCombinations', { defaultValue: 'SKU combinations' })}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => openGuide(3)} aria-label={t('products.guide.open', { defaultValue: 'Product creation guide' })}>
                      <Info size={15} />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleRegenerate} disabled={!canManageVariants || regenerating || (product?.variantTypes.length ?? 0) === 0}>
                      <RefreshCw size={14} className={`mr-2 ${regenerating ? 'animate-spin' : ''}`} />
                      {t('products.generateSkus', { defaultValue: 'Generate SKUs' })}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!canManageVariants ? (
                  <div className="rounded-lg border border-dashed border-border bg-muted/35 p-4 text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">
                    {t('products.skuAvailableAfterCreate', { defaultValue: 'SKU combinations become available after product creation.' })}
                  </div>
                ) : product.variants.length === 0 ? (
                  <div className="grid place-items-center rounded-lg border border-dashed border-border bg-muted/35 px-4 py-10 text-center">
                    <Wand2 className="mb-3 text-muted-foreground" size={28} />
                    <p className="text-[15px] font-semibold tracking-[-0.011em]">{t('products.noSkuCombinations', { defaultValue: 'No SKU combinations yet' })}</p>
                    <p className="mt-1 max-w-md text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">
                      {t('products.generateSkuHint', { defaultValue: 'You already added variant options. Generate SKUs to create every color and model combination.' })}
                    </p>
                    <Button className="mt-4" onClick={handleRegenerate} disabled={regenerating}>
                      <RefreshCw size={16} className={`mr-2 ${regenerating ? 'animate-spin' : ''}`} />
                      {regenerating ? t('products.generating', { defaultValue: 'Generating...' }) : t('products.generateSkus', { defaultValue: 'Generate SKUs' })}
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">{t('common.id', { defaultValue: 'ID' })}</TableHead>
                        <TableHead>{t('common.name', { defaultValue: 'Name' })}</TableHead>
                        <TableHead className="w-32">{t('common.price', { defaultValue: 'Price' })}</TableHead>
                        <TableHead className="w-28">{t('products.quantity', { defaultValue: 'Quantity' })}</TableHead>
                        <TableHead className="w-24">{t('products.isActive', { defaultValue: 'Is active' })}</TableHead>
                        <TableHead className="w-48">{t('products.images', { defaultValue: 'Images' })}</TableHead>
                        <TableHead>{t('products.combination', { defaultValue: 'Combination' })}</TableHead>
                        <TableHead className="w-24 text-right">{t('common.save', { defaultValue: 'Save' })}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {product.variants.map(variant => {
                        const row = variantRows[variant.id]
                        if (!row) return null

                        return (
                          <TableRow key={variant.id}>
                            <TableCell className="font-mono text-[12px] tracking-[-0.003em] text-muted-foreground tabular-nums">{variant.id}</TableCell>
                            <TableCell>
                              <Input
                                className="h-9"
                                value={row.name}
                                onFocus={() => setPreviewHighlight('name')}
                                onBlur={() => setPreviewHighlight(null)}
                                onChange={event => updateVariantRow(variant.id, { name: event.target.value })}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={0}
                                className="h-9"
                                value={row.price}
                                onFocus={() => setPreviewHighlight('skuPrice')}
                                onBlur={() => setPreviewHighlight(null)}
                                onChange={event => updateVariantRow(variant.id, { price: event.target.value })}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={0}
                                className="h-9"
                                value={row.quantity}
                                onFocus={() => setPreviewHighlight('skuStock')}
                                onBlur={() => setPreviewHighlight(null)}
                                onChange={event => updateVariantRow(variant.id, { quantity: event.target.value })}
                              />
                            </TableCell>
                            <TableCell>
                              <Switch checked={row.isActive} onFocus={() => setPreviewHighlight('badges')} onBlur={() => setPreviewHighlight(null)} onCheckedChange={checked => updateVariantRow(variant.id, { isActive: checked })} />
                            </TableCell>
                            <TableCell>
                              <ImagePicker
                                label={t('products.primaryImage', { defaultValue: 'Primary image' })}
                                fileName={row.image?.name}
                                previewUrl={resolveMediaUrl(variant.images[0])}
                                compact
                                onFocus={() => setPreviewHighlight('image')}
                                onBlur={() => setPreviewHighlight(null)}
                                onSelect={file => updateVariantRow(variant.id, { image: file })}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1.5">
                                {variant.combination.length > 0 ? variant.combination.map(item => (
                                  <span key={`${variant.id}-${item.variantTypeName}-${item.optionId}`} className="rounded-md border border-border px-2 py-1 text-[11px] font-normal tracking-[-0.003em] text-muted-foreground">
                                    {item.variantTypeName}: <span className="font-semibold tracking-[-0.005em] text-foreground">{item.optionName}</span>
                                  </span>
                                )) : (
                                  <span className="text-[12px] font-normal tracking-[-0.003em] text-muted-foreground">{getVariantLabel(variant)}</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button size="sm" variant="outline" onClick={() => handleSaveVariant(variant.id)} disabled={row.saving}>
                                {row.saving ? '...' : <CheckCircle2 size={14} />}
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
              <div className="flex justify-between gap-2 border-t border-border px-6 py-4">
                <Button variant="outline" onClick={() => setActiveStep(2)}>{t('common.back', { defaultValue: 'Back' })}</Button>
                {product?.variants.length > 0 && (
                  <Button onClick={handleSaveAllVariants} disabled={savingAllVariants}>
                    <Save size={16} className="mr-2" />
                    {savingAllVariants ? t('common.saving', { defaultValue: 'Saving...' }) : t('products.saveAllSkuData', { defaultValue: 'Save all SKU data' })}
                  </Button>
                )}
              </div>
            </Card>}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="hidden w-4 bg-transparent after:w-1 xl:flex" />

        <ResizablePanel defaultSize={50} minSize={28} className="min-w-0" onResize={setPreviewPanelSize}>
          <aside className="min-w-0 pl-2">
            <div className="sticky top-20 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[18px] font-semibold tracking-[-0.016em] leading-[1.2]">
                    <Package size={18} />
                    {t('products.livePreview', { defaultValue: 'Live preview' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={previewIsHorizontal ? 'grid gap-4 lg:grid-cols-[minmax(180px,42%)_minmax(0,1fr)]' : 'space-y-4'}>
                    <div className={`${previewIsHorizontal ? 'min-h-80' : 'aspect-[4/3]'} overflow-hidden rounded-lg border border-border bg-muted transition-all ${previewHighlightClass('image')}`}>
                      {previewImage ? (
                        <img src={previewImage} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <div className="grid h-full place-items-center text-muted-foreground">
                          <Package size={42} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 space-y-4">
                      <div className="space-y-2 rounded-lg p-2">
                        <p className={`inline-block rounded px-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground transition-all ${previewHighlightClass('category')}`}>
                          {pickLanguageString(selectedCategory?.name ?? product?.categoryName) || t('common.category', { defaultValue: 'Category' })}
                        </p>
                        <h2 className={`${previewIsHorizontal ? 'text-[24px]' : 'text-[20px]'} rounded px-1 font-display font-bold tracking-[-0.018em] leading-[1.15] transition-all ${previewHighlightClass('name')}`}>
                          {infoForm.name || t('products.productNameFallback', { defaultValue: 'Product name' })}
                        </h2>
                        {infoForm.description && (
                          <p className={`line-clamp-3 rounded px-1 text-[14px] font-normal tracking-[-0.006em] leading-[1.5] text-muted-foreground transition-all ${previewHighlightClass('description')}`}>{infoForm.description}</p>
                        )}
                      </div>

                      <div className={`flex flex-wrap gap-2 rounded-lg p-2 transition-all ${previewHighlightClass('badges')}`}>
                        <Badge variant={infoForm.isActive ? 'default' : 'secondary'}>{infoForm.isActive ? t('common.active', { defaultValue: 'Active' }) : t('common.inactive', { defaultValue: 'Inactive' })}</Badge>
                        <Badge variant="outline">{infoForm.syncSource === 0 ? t('products.manual', { defaultValue: 'Manual' }) : t('products.external', { defaultValue: 'External' })}</Badge>
                        <Badge variant="outline">{product?.variants.length ?? 0} {t('products.sku', { defaultValue: 'SKU' })}</Badge>
                      </div>

                      {product?.variantTypes.length ? (
                        <div className={`space-y-3 rounded-lg border-t border-border p-2 pt-3 transition-all ${previewHighlightClass('variants')}`}>
                          {product.variantTypes.map(type => (
                            <div key={type.id}>
                              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{type.name}</p>
                              <div className="flex flex-wrap gap-2">
                                {type.options.slice(0, 6).map(option => (
                                  <span key={option.id} className="rounded-md border border-border px-2 py-1 text-[12px] font-medium tracking-[-0.003em]">
                                    {option.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      <div className="rounded-lg bg-accent/10 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-accent">{t('products.startingPrice', { defaultValue: 'Starting price' })}</p>
                        <p className={`mt-1 rounded px-1 text-[24px] font-bold tracking-[-0.018em] leading-[1.15] font-display text-accent tabular-nums transition-all ${previewHighlightClass('skuPrice')}`}>
                          {previewPrice > 0 ? `${formatCurrency(previewPrice)} ${t('products.currencySom', { defaultValue: "so'm" })}` : t('products.setSkuPrice', { defaultValue: 'Set SKU price' })}
                        </p>
                        <p className={`mt-1 inline-block rounded px-1 text-[12px] font-normal tracking-[-0.003em] text-muted-foreground transition-all ${previewHighlightClass('skuStock')}`}>
                          {t('products.quantity', { defaultValue: 'Quantity' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-2 pt-6 text-[14px] font-normal tracking-[-0.006em]">
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-accent" />
                    <p className="text-muted-foreground">{t('products.createFirstHint', { defaultValue: 'Create product first, then manage variants from the same page.' })}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-accent" />
                    <p className="text-muted-foreground">{t('products.refreshPreservesHint', { defaultValue: 'Refreshing combinations preserves existing matching SKUs.' })}</p>
                  </div>
                  <Link to="/admin/products" className="inline-flex pt-2 text-[14px] font-medium tracking-[-0.011em] text-accent hover:underline">
                    {t('products.backToProducts', { defaultValue: 'Back to products' })}
                  </Link>
                </CardContent>
              </Card>
            </div>
          </aside>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

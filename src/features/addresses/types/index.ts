export type Address = {
  id: number
  label: string
  city: string
  district: string
  street: string
  house: string
  extra?: string | null
  btsCityCode: string
  btsBranchCode?: string | null
  isDefault: boolean
  createdAt: string
}

export type CreateAddressRequest = {
  label: string
  city: string
  district: string
  street: string
  house: string
  extra?: string | null
  btsCityCode: string
  btsBranchCode?: string | null
  isDefault: boolean
}

export type UpdateAddressRequest = CreateAddressRequest

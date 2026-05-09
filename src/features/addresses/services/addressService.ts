import { apiRequest } from '@/shared/api/http'
import type { Address, CreateAddressRequest, UpdateAddressRequest } from '../types'

export const addressService = {
  getAll: () => apiRequest<Address[]>('/api/addresses'),

  getById: (id: number) => apiRequest<Address>(`/api/addresses/${id}`),

  create: (data: CreateAddressRequest) =>
    apiRequest<Address>('/api/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  update: (id: number, data: UpdateAddressRequest) =>
    apiRequest<Address>(`/api/addresses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  remove: (id: number) =>
    apiRequest<void>(`/api/addresses/${id}`, { method: 'DELETE' }),

  setDefault: (id: number) =>
    apiRequest<Address>(`/api/addresses/${id}/set-default`, { method: 'PUT' }),
}

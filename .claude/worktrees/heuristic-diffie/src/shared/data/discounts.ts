export interface Discount {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  appliesTo: 'all' | 'category' | 'products';
  categoryIds?: string[];
  productIds?: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export const discounts: Discount[] = [
  { id: 'd1', name: 'Summer Sale', type: 'percentage', value: 15, appliesTo: 'all', startDate: '2025-06-01', endDate: '2025-06-30', isActive: true },
  { id: 'd2', name: 'TV Clearance', type: 'percentage', value: 20, appliesTo: 'category', categoryIds: ['3'], startDate: '2025-06-05', endDate: '2025-06-15', isActive: true },
  { id: 'd3', name: 'Kitchen Bundle', type: 'fixed', value: 50, appliesTo: 'category', categoryIds: ['6'], startDate: '2025-06-01', endDate: '2025-07-01', isActive: false },
];

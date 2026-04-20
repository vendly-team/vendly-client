export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  registeredAt: string;
  orderCount: number;
  isBlocked: boolean;
  addresses: { id: string; city: string; district: string; street: string; house: string; notes?: string; isDefault: boolean }[];
}

export const customers: Customer[] = [
  { id: 'c1', firstName: 'Alex', lastName: 'Morgan', email: 'alex.morgan@email.com', phone: '+1 (555) 100-1001', registeredAt: '2024-11-10T10:00:00Z', orderCount: 5, isBlocked: false, addresses: [{ id: 'a1', city: 'New York', district: 'Manhattan', street: '5th Avenue', house: '42B', isDefault: true }] },
  { id: 'c2', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@email.com', phone: '+1 (555) 100-1002', registeredAt: '2024-12-05T10:00:00Z', orderCount: 3, isBlocked: false, addresses: [{ id: 'a2', city: 'Los Angeles', district: 'Hollywood', street: 'Sunset Blvd', house: '101', isDefault: true }] },
  { id: 'c3', firstName: 'Mike', lastName: 'Chen', email: 'mike.chen@email.com', phone: '+1 (555) 100-1003', registeredAt: '2025-01-15T10:00:00Z', orderCount: 8, isBlocked: false, addresses: [{ id: 'a3', city: 'San Francisco', district: 'SOMA', street: 'Market St', house: '500', isDefault: true }] },
  { id: 'c4', firstName: 'Emily', lastName: 'Davis', email: 'emily.d@email.com', phone: '+1 (555) 100-1004', registeredAt: '2025-02-20T10:00:00Z', orderCount: 2, isBlocked: false, addresses: [] },
  { id: 'c5', firstName: 'James', lastName: 'Wilson', email: 'james.w@email.com', phone: '+1 (555) 100-1005', registeredAt: '2025-03-01T10:00:00Z', orderCount: 1, isBlocked: true, addresses: [{ id: 'a5', city: 'Chicago', district: 'Loop', street: 'Michigan Ave', house: '200', isDefault: true }] },
  { id: 'c6', firstName: 'Lisa', lastName: 'Anderson', email: 'lisa.a@email.com', phone: '+1 (555) 100-1006', registeredAt: '2025-03-15T10:00:00Z', orderCount: 4, isBlocked: false, addresses: [{ id: 'a6', city: 'Houston', district: 'Midtown', street: 'Main St', house: '75A', isDefault: true }] },
  { id: 'c7', firstName: 'David', lastName: 'Lee', email: 'david.lee@email.com', phone: '+1 (555) 100-1007', registeredAt: '2025-04-01T10:00:00Z', orderCount: 6, isBlocked: false, addresses: [{ id: 'a7', city: 'Seattle', district: 'Capitol Hill', street: 'Broadway E', house: '330', isDefault: true }] },
  { id: 'c8', firstName: 'Rachel', lastName: 'Kim', email: 'rachel.k@email.com', phone: '+1 (555) 100-1008', registeredAt: '2025-05-10T10:00:00Z', orderCount: 0, isBlocked: false, addresses: [] },
];

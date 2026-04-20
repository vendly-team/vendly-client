export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'manager';
  lastLogin: string;
  isBlocked: boolean;
}

export const adminUsers: AdminUser[] = [
  { id: 'u1', firstName: 'Admin', lastName: 'User', email: 'admin@test.com', role: 'admin', lastLogin: '2025-06-09T10:00:00Z', isBlocked: false },
  { id: 'u2', firstName: 'Manager', lastName: 'User', email: 'manager@test.com', role: 'manager', lastLogin: '2025-06-09T08:00:00Z', isBlocked: false },
];

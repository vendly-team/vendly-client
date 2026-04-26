export type UserRole = 0 | 1 | 2;

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  role: UserRole;
  isBlocked: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type CreateUserRequest = {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  email?: string;
  role: UserRole;
};

export type UpdateUserRequest = {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
};

export type AssignRoleRequest = {
  role: UserRole;
};

export const userRoles: Array<{ value: UserRole; label: string }> = [
  { value: 0, label: "Customer" },
  { value: 1, label: "Admin" },
  { value: 2, label: "Manager" },
];

export const getRoleLabel = (role: UserRole) => userRoles.find(item => item.value === role)?.label ?? "Customer";

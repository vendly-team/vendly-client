import type { AssignRoleRequest, CreateUserRequest, UpdateUserRequest, User, UserRole } from "@/features/users/types";
import { apiRequest } from "@/shared/api/http";

export const getAll = () => apiRequest<User[]>("/api/users");

export const getById = (id: number | string) => apiRequest<User>(`/api/users/${id}`);

export const create = (data: CreateUserRequest) =>
  apiRequest<void>("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const update = (id: number | string, data: UpdateUserRequest) =>
  apiRequest<void>(`/api/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const block = (id: number | string) =>
  apiRequest<void>(`/api/users/${id}/block`, {
    method: "PATCH",
  });

export const assignRole = (id: number | string, role: UserRole) => {
  const data: AssignRoleRequest = { role };

  return apiRequest<void>(`/api/users/${id}/assign-role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

export const userService = { getAll, getById, create, update, block, assignRole };

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AssignRoleModal } from "@/features/users/components/AssignRoleModal";
import { UserForm } from "@/features/users/components/UserForm";
import { UserList } from "@/features/users/components/UserList";
import { useUsers } from "@/features/users/hooks/useUsers";
import type { CreateUserRequest, UpdateUserRequest, User, UserRole } from "@/features/users/types";
import { userService } from "@/services/user.service";
import { useAuthStore } from "@/shared/store/authStore";

export const UsersPage = () => {
  const { users, loading, error, fetchUsers } = useUsers();
  const { user: currentUser } = useAuthStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [roleUser, setRoleUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (data: CreateUserRequest | UpdateUserRequest) => {
    setSubmitting(true);

    try {
      await userService.create(data as CreateUserRequest);
      await fetchUsers();
      setCreateOpen(false);
      toast.success("User created");
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (data: CreateUserRequest | UpdateUserRequest) => {
    if (!editingUser) return;
    setSubmitting(true);

    try {
      await userService.update(editingUser.id, data as UpdateUserRequest);
      await fetchUsers();
      setEditingUser(null);
      toast.success("User updated");
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Failed to update user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleBlock = async (targetUser: User) => {
    if (String(targetUser.id) === currentUser?.id) {
      toast.error("You cannot block yourself");
      return;
    }

    try {
      await userService.block(targetUser.id);
      await fetchUsers();
      toast.success(targetUser.isBlocked ? "User unblocked" : "User blocked");
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Failed to update block status");
    }
  };

  const handleAssignRole = async (role: UserRole) => {
    if (!roleUser) return;
    setSubmitting(true);

    try {
      await userService.assignRole(roleUser.id, role);
      await fetchUsers();
      setRoleUser(null);
      toast.success("Role updated");
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Failed to assign role");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">

      {/* ── 1. Page title ──────────────────────────────────── */}
      <h1 className="text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display text-foreground">
        Users
      </h1>

      {/* ── 2. Toolbar surface ─────────────────────────────── */}
      <div className="flex justify-end rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 h-9 px-4 bg-accent text-accent-foreground rounded-lg text-[14px] font-semibold tracking-[-0.011em] hover:bg-accent/90 transition-colors"
        >
          <Plus size={15} />
          Create User
        </button>
      </div>

      {/* ── 3. List container ──────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <UserList
          users={users.filter(user => user.role !== 0)}
          currentRole={currentUser?.role}
          loading={loading}
          error={error}
          onEdit={setEditingUser}
          onToggleBlock={user => void handleToggleBlock(user)}
          onAssignRole={setRoleUser}
        />
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
          </DialogHeader>
          <UserForm mode="create" submitting={submitting} onSubmit={handleCreate} />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingUser)} onOpenChange={open => { if (!open) setEditingUser(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <UserForm mode="update" user={editingUser} submitting={submitting} onSubmit={handleUpdate} />
        </DialogContent>
      </Dialog>

      <AssignRoleModal
        user={roleUser}
        open={Boolean(roleUser)}
        submitting={submitting}
        onOpenChange={open => { if (!open) setRoleUser(null); }}
        onSubmit={handleAssignRole}
      />
    </div>
  );
};

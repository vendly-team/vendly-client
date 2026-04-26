import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Users</h1>
        <Button type="button" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setCreateOpen(true)}>
          <Plus size={16} />
          Create User
        </Button>
      </div>

      <UserList
        users={users.filter(user => user.role !== 0)}
        currentRole={currentUser?.role}
        loading={loading}
        error={error}
        onEdit={setEditingUser}
        onToggleBlock={user => void handleToggleBlock(user)}
        onAssignRole={setRoleUser}
      />

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

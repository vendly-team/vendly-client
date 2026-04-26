import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { UserForm } from "@/features/users/components/UserForm";
import { UserList } from "@/features/users/components/UserList";
import { useUsers } from "@/features/users/hooks/useUsers";
import type { CreateUserRequest, UpdateUserRequest, User } from "@/features/users/types";
import { userService } from "@/services/user.service";
import { useAuthStore } from "@/shared/store/authStore";

export const AdminCustomersPage = () => {
  const { users, loading, error, fetchUsers } = useUsers();
  const { user: currentUser } = useAuthStore();
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const customers = useMemo(() => {
    const normalizedSearch = search.toLowerCase();

    return users
      .filter(user => user.role === 0)
      .filter(user => {
        if (!normalizedSearch) return true;

        return (
          user.firstName.toLowerCase().includes(normalizedSearch) ||
          user.lastName.toLowerCase().includes(normalizedSearch) ||
          user.phone.includes(normalizedSearch) ||
          (user.email ?? "").toLowerCase().includes(normalizedSearch)
        );
      });
  }, [search, users]);

  const handleUpdate = async (data: CreateUserRequest | UpdateUserRequest) => {
    if (!editingUser) return;
    setSubmitting(true);

    try {
      await userService.update(editingUser.id, data as UpdateUserRequest);
      await fetchUsers();
      setEditingUser(null);
      toast.success("Customer updated");
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Failed to update customer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleBlock = async (targetUser: User) => {
    try {
      await userService.block(targetUser.id);
      await fetchUsers();
      toast.success(targetUser.isBlocked ? "Customer unblocked" : "Customer blocked");
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Failed to update block status");
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-display font-bold">Customers</h1>
      <div className="mb-4">
        <div className="relative w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search customers..." value={search} onChange={event => setSearch(event.target.value)} className="h-9 pl-9" />
        </div>
      </div>
      <UserList
        users={customers}
        currentRole={currentUser?.role}
        loading={loading}
        error={error}
        allowAssignRole={false}
        onEdit={setEditingUser}
        onToggleBlock={user => void handleToggleBlock(user)}
        onAssignRole={() => undefined}
      />

      <Dialog open={Boolean(editingUser)} onOpenChange={open => { if (!open) setEditingUser(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <UserForm mode="update" user={editingUser} submitting={submitting} onSubmit={handleUpdate} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCustomersPage;

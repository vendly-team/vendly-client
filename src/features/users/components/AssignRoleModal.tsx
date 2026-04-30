import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { userRoles, type User, type UserRole } from "@/features/users/types";

type AssignRoleModalProps = {
  user: User | null;
  open: boolean;
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (role: UserRole) => Promise<void> | void;
};

export const AssignRoleModal = ({ user, open, submitting = false, onOpenChange, onSubmit }: AssignRoleModalProps) => {
  const [role, setRole] = useState<UserRole>(user?.role ?? 0);

  useEffect(() => {
    setRole(user?.role ?? 0);
  }, [user]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Role</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">
            {user ? `${user.firstName} ${user.lastName}` : "Select user role"}
          </div>
          <Select value={String(role)} onValueChange={value => setRole(Number(value) as UserRole)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {userRoles.map(item => (
                <SelectItem key={item.value} value={String(item.value)}>{item.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" disabled={submitting} className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => void onSubmit(role)}>
            {submitting ? "Saving..." : "Assign Role"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

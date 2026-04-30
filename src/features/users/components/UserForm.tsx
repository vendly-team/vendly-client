import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getRoleLabel, userRoles, type CreateUserRequest, type UpdateUserRequest, type User, type UserRole } from "@/features/users/types";

type UserFormMode = "create" | "update";

type UserFormProps = {
  mode: UserFormMode;
  user?: User | null;
  submitting?: boolean;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => Promise<void> | void;
};

type UserFormState = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  role: UserRole;
};

const emptyState: UserFormState = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  password: "",
  role: 0,
};

export const UserForm = ({ mode, user, submitting = false, onSubmit }: UserFormProps) => {
  const [form, setForm] = useState<UserFormState>(emptyState);

  useEffect(() => {
    if (mode === "update" && user) {
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email ?? "",
        password: "",
        role: user.role,
      });
      return;
    }

    setForm(emptyState);
  }, [mode, user]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (mode === "create") {
      void onSubmit({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        email: form.email || undefined,
        password: form.password,
        role: form.role,
      });
      return;
    }

    void onSubmit({
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      email: form.email || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input placeholder="First name" value={form.firstName} onChange={event => setForm({ ...form, firstName: event.target.value })} required />
        <Input placeholder="Last name" value={form.lastName} onChange={event => setForm({ ...form, lastName: event.target.value })} required />
      </div>
      <Input placeholder="Phone" value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} required />
      <Input placeholder="Email (optional)" type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} />
      {mode === "create" ? (
        <>
          <Input placeholder="Password" type="password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} required minLength={8} />
          <Select value={String(form.role)} onValueChange={value => setForm({ ...form, role: Number(value) as UserRole })}>
            <SelectTrigger>
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              {userRoles.map(role => (
                <SelectItem key={role.value} value={String(role.value)}>{role.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      ) : (
        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-[14px] font-normal tracking-[-0.006em]">
          <span className="text-muted-foreground">Role: </span>
          <span className="font-semibold tracking-[-0.011em] text-foreground">{getRoleLabel(form.role)}</span>
        </div>
      )}
      <Button type="submit" disabled={submitting} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
        {submitting ? "Saving..." : mode === "create" ? "Create User" : "Save Changes"}
      </Button>
    </form>
  );
};

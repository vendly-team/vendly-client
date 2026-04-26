import { Lock, Pencil, Shield, Unlock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getRoleLabel, type User } from "@/features/users/types";

type ActorRole = "admin" | "manager" | "customer";

type UserListProps = {
  users: User[];
  currentRole: ActorRole | undefined;
  loading: boolean;
  error: string | null;
  onEdit: (user: User) => void;
  onToggleBlock: (user: User) => void;
  onAssignRole: (user: User) => void;
  allowAssignRole?: boolean;
};

const roleBadgeClass = (role: User["role"]) => {
  if (role === 1) return "border-accent/15 bg-accent/10 text-accent hover:bg-accent/10";
  if (role === 2) return "border-info/15 bg-info/10 text-info hover:bg-info/10";
  return "border-primary/10 bg-primary/5 text-primary hover:bg-primary/5";
};

export const UserList = ({ users, currentRole, loading, error, onEdit, onToggleBlock, onAssignRole, allowAssignRole = true }: UserListProps) => {
  const isAdmin = currentRole === "admin";
  const isManager = currentRole === "manager";

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Name</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Blocked</TableHead>
          <TableHead className="w-48 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading && (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
              Loading users...
            </TableCell>
          </TableRow>
        )}
        {!loading && error && (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center text-destructive">
              {error}
            </TableCell>
          </TableRow>
        )}
        {!loading && !error && users.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
              No users found
            </TableCell>
          </TableRow>
        )}
        {!loading && !error && users.map(user => {
          const canManagerAct = isManager && user.role === 0;
          const canEdit = isAdmin || canManagerAct;
          const canBlock = isAdmin || canManagerAct;
          const canAssignRole = allowAssignRole && isAdmin;

          return (
            <TableRow key={user.id}>
              <TableCell>
                <div className="font-semibold text-foreground">{user.firstName} {user.lastName}</div>
              </TableCell>
              <TableCell className="text-muted-foreground">{user.phone}</TableCell>
              <TableCell className="text-muted-foreground">{user.email || "-"}</TableCell>
              <TableCell>
                <Badge variant="outline" className={roleBadgeClass(user.role)}>
                  {getRoleLabel(user.role)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={user.isBlocked
                    ? "border-destructive/15 bg-destructive/10 text-destructive hover:bg-destructive/10"
                    : "border-success/15 bg-success/10 text-success hover:bg-success/10"}
                >
                  {user.isBlocked ? "Blocked" : "Active"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  {canEdit && (
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(user)} title="Edit" aria-label="Edit">
                      <Pencil size={15} />
                    </Button>
                  )}
                  {canBlock && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={user.isBlocked ? "h-8 w-8 text-success hover:bg-success/10 hover:text-success" : "h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"}
                      onClick={() => onToggleBlock(user)}
                      title={user.isBlocked ? "Unblock" : "Block"}
                      aria-label={user.isBlocked ? "Unblock" : "Block"}
                    >
                      {user.isBlocked ? <Unlock size={15} /> : <Lock size={15} />}
                    </Button>
                  )}
                  {canAssignRole && (
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-accent hover:bg-accent/10 hover:text-accent" onClick={() => onAssignRole(user)} title="Assign role" aria-label="Assign role">
                      <Shield size={15} />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

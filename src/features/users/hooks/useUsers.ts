import { useCallback, useEffect, useState } from "react";
import { userService } from "@/services/user.service";
import type { User } from "@/features/users/types";

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await userService.getAll();
      setUsers(data.filter(user => !user.isDeleted));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, fetchUsers };
};

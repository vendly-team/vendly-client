import { useCallback, useEffect, useState } from "react";
import { userService } from "@/services/user.service";
import type { User } from "@/features/users/types";

export const useUser = (id: number | string | null | undefined) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await userService.getById(id);
      setUser(data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load user");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  return { user, loading, error, fetchUser };
};

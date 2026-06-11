import { useEffect, useState } from "react";
import { apiRequest } from "@/shared/api/http";

type UsdRate = {
  rate: number;
  diff: number;
  date: string;
};

export function useUsdRate() {
  const [data, setData] = useState<UsdRate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void apiRequest<UsdRate>("/api/currencies/usd-rate")
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

import { useEffect, useState } from "react";
import { categoriesApi, mapCategoryDto } from "@/shared/api/categoriesApi";
import type { Category } from "@/shared/types";

type UseCategoriesOptions = {
  activeOnly?: boolean;
};

export const useCategories = ({ activeOnly = false }: UseCategoriesOptions = {}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      setError(null);

      try {
        const items = await categoriesApi.getAll();
        const mapped = items.map(mapCategoryDto);
        setCategories(activeOnly ? mapped.filter(category => category.isActive) : mapped);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    void loadCategories();
  }, [activeOnly]);

  return { categories, loading, error };
};

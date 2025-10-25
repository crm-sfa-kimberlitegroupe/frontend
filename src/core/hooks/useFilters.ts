/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useMemo } from 'react';

export interface UseFiltersOptions<T extends Record<string, any>> {
  initialFilters?: Partial<T>;
  onFilterChange?: (filters: T) => void;
}

export interface UseFiltersResult<T extends Record<string, any>> {
  filters: T;
  setFilter: <K extends keyof T>(key: K, value: T[K]) => void;
  setFilters: (filters: Partial<T>) => void;
  resetFilters: () => void;
  clearFilter: <K extends keyof T>(key: K) => void;
  hasActiveFilters: boolean;
}

export function useFilters<T extends Record<string, any>>(
  defaultFilters: T,
  options: UseFiltersOptions<T> = {}
): UseFiltersResult<T> {
  const { initialFilters, onFilterChange } = options;

  const [filters, setFiltersState] = useState<T>({
    ...defaultFilters,
    ...initialFilters,
  });

  const setFilter = useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      setFiltersState((prev) => {
        const newFilters = { ...prev, [key]: value };
        onFilterChange?.(newFilters);
        return newFilters;
      });
    },
    [onFilterChange]
  );

  const setFilters = useCallback(
    (newFilters: Partial<T>) => {
      setFiltersState((prev) => {
        const updated = { ...prev, ...newFilters };
        onFilterChange?.(updated);
        return updated;
      });
    },
    [onFilterChange]
  );

  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters);
    onFilterChange?.(defaultFilters);
  }, [defaultFilters, onFilterChange]);

  const clearFilter = useCallback(
    <K extends keyof T>(key: K) => {
      setFilter(key, defaultFilters[key]);
    },
    [defaultFilters, setFilter]
  );

  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).some(
      (key) => filters[key] !== defaultFilters[key]
    );
  }, [filters, defaultFilters]);

  return {
    filters,
    setFilter,
    setFilters,
    resetFilters,
    clearFilter,
    hasActiveFilters,
  };
}

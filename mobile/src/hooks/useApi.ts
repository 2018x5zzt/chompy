/**
 * Generic API hook wrapper for data fetching.
 */

import { useCallback, useEffect, useState } from "react";
import type { ApiError } from "../types";

interface UseApiError {
  readonly message: string;
  readonly detail?: string;
  readonly status?: number;
}

interface UseApiResult<T> {
  readonly data: T | null;
  readonly loading: boolean;
  readonly error: UseApiError | null;
  refetch: () => Promise<void>;
}

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "detail" in error &&
    "status" in error &&
    typeof (error as { detail: unknown }).detail === "string" &&
    typeof (error as { status: unknown }).status === "number"
  );
}

/**
 * Hook for fetching data from an async function.
 *
 * @param fetchFn - Async function that returns the data.
 * @param immediate - Whether to fetch immediately on mount.
 */
export function useApi<T>(
  fetchFn: () => Promise<T>,
  immediate: boolean = true,
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<UseApiError | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err: unknown) {
      if (isApiError(err)) {
        setError({
          message: err.detail,
          detail: err.detail,
          status: err.status,
        });
      } else {
        const message =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError({ message });
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    if (immediate) {
      void refetch();
    }
  }, [immediate, refetch]);

  return { data, loading, error, refetch };
}

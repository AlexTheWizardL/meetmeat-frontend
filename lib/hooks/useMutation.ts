/**
 * useMutation - Hook for async mutations (create, update, delete)
 *
 * Unlike useAsync, mutations don't run automatically on mount.
 * They provide a mutate function to trigger the operation.
 */

import { useState, useCallback, useRef } from 'react';

export interface MutationState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
}

export interface UseMutationResult<T, TVariables> extends MutationState<T> {
  mutate: (variables: TVariables) => Promise<T>;
  reset: () => void;
}

interface UseMutationOptions<T, TVariables> {
  /** Called on successful mutation */
  onSuccess?: (data: T, variables: TVariables) => void;
  /** Called on error */
  onError?: (error: Error, variables: TVariables) => void;
}

/**
 * Hook for managing async mutations
 *
 * @example
 * const { mutate, isLoading } = useMutation(
 *   (data: CreateProfileDto) => profilesApi.create(data),
 *   { onSuccess: () => refetchProfiles() }
 * );
 *
 * // Later...
 * await mutate({ name: 'John', title: 'Developer' });
 */
export function useMutation<T, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<T>,
  options: UseMutationOptions<T, TVariables> = {}
): UseMutationResult<T, TVariables> {
  const [state, setState] = useState<MutationState<T>>({
    data: null,
    isLoading: false,
    error: null,
    isSuccess: false,
  });

  const isMounted = useRef(true);

  const mutate = useCallback(
    async (variables: TVariables): Promise<T> => {
      setState({ data: null, isLoading: true, error: null, isSuccess: false });

      try {
        const result = await mutationFn(variables);
        if (isMounted.current) {
          setState({ data: result, isLoading: false, error: null, isSuccess: true });
          options.onSuccess?.(result, variables);
        }
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        if (isMounted.current) {
          setState({ data: null, isLoading: false, error, isSuccess: false });
          options.onError?.(error, variables);
        }
        throw error;
      }
    },
    [mutationFn, options]
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null, isSuccess: false });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}

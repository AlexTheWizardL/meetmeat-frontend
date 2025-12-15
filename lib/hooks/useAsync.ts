import { useState, useCallback, useEffect, useRef } from 'react';

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export interface UseAsyncResult<T> extends AsyncState<T> {
  refetch: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

interface UseAsyncOptions {
  skip?: boolean;
}

export function useAsync<T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList = [],
  options: UseAsyncOptions = {}
): UseAsyncResult<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: !options.skip,
    error: null,
  });

  const isMounted = useRef(true);

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await asyncFn();
      if (isMounted.current) {
        setState({ data: result, isLoading: false, error: null });
      }
    } catch (err) {
      if (isMounted.current) {
        setState({
          data: null,
          isLoading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    isMounted.current = true;
    if (!options.skip) {
      void execute();
    }
    return () => {
      isMounted.current = false;
    };
  }, [execute, options.skip]);

  const setData = useCallback((value: React.SetStateAction<T | null>) => {
    setState((prev) => ({
      ...prev,
      data: typeof value === 'function' ? (value as (prev: T | null) => T | null)(prev.data) : value,
    }));
  }, []);

  return {
    ...state,
    refetch: execute,
    setData,
  };
}

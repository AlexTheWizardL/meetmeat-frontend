// Helper to ensure Skia loads or throws inside of React Suspense on web.
import React from 'react';

import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

interface PromiseWrapper<T> {
  read(): T;
}

function wrapPromise<T>(promise: Promise<T>): PromiseWrapper<T> {
  let status: 'pending' | 'success' | 'error' = 'pending';
  let result: T | Error;
  const suspender = promise.then(
    (r: T) => {
      status = 'success';
      result = r;
    },
    (e: unknown) => {
      status = 'error';
      result = e instanceof Error ? e : new Error(String(e));
    }
  );
  return {
    read(): T {
      if (status === 'pending') {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw suspender;
      }
      if (status === 'error') {
        // result is always an Error when status is 'error'
        throw result as Error;
      }
      return result as T;
    },
  };
}

const promiseMap = new Map<string, PromiseWrapper<void>>();

const getSuspendingPromise = (): void => {
  const id = 'skia';
  const existing = promiseMap.get(id);
  if (existing) {
    return existing.read();
  }

  const loader = wrapPromise(LoadSkiaWeb());
  promiseMap.set(id, loader);
  return loader.read();
};

const getResolvedPromise = React.cache(getSuspendingPromise);

export function AsyncSkia(): null {
  getResolvedPromise();
  return null;
}

// Hook to ensure Skia is loaded before using Skia APIs
export function useSkiaLoaded(): void {
  getResolvedPromise();
}

/**
 * usePosters - Hook for poster management
 */

import { useCallback } from 'react';
import { postersApi } from '@/lib/api';
import { useAsync } from './useAsync';
import { useMutation } from './useMutation';
import type { Poster, CreatePosterDto, UpdatePosterDto, ExportPosterDto } from '@/types';

export interface UsePostersResult {
  posters: Poster[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createPoster: (data: CreatePosterDto) => Promise<Poster>;
  updatePoster: (id: string, data: UpdatePosterDto) => Promise<Poster>;
  deletePoster: (id: string) => Promise<void>;
  exportPoster: (id: string, data: ExportPosterDto) => Promise<{ url: string }>;
  isCreating: boolean;
  isUpdating: boolean;
  isExporting: boolean;
}

export function usePosters(profileId?: string): UsePostersResult {
  const {
    data: posters,
    isLoading,
    error,
    refetch,
    setData: setPosters,
  } = useAsync(() => postersApi.getAll(profileId), [profileId]);

  const createMutation = useMutation(
    (data: CreatePosterDto) => postersApi.create(data),
    {
      onSuccess: (newPoster) => {
        setPosters((prev) => (prev ? [newPoster, ...prev] : [newPoster]));
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: UpdatePosterDto }) => postersApi.update(id, data),
    {
      onSuccess: (updatedPoster) => {
        setPosters((prev) =>
          prev?.map((p) => (p.id === updatedPoster.id ? updatedPoster : p)) ?? null
        );
      },
    }
  );

  const deleteMutation = useMutation(
    (id: string) => postersApi.delete(id),
    {
      onSuccess: (_, id) => {
        setPosters((prev) => prev?.filter((p) => p.id !== id) ?? null);
      },
    }
  );

  const exportMutation = useMutation(
    ({ id, data }: { id: string; data: ExportPosterDto }) => postersApi.export(id, data)
  );

  const createPoster = useCallback(
    (data: CreatePosterDto) => createMutation.mutate(data),
    [createMutation]
  );

  const updatePoster = useCallback(
    (id: string, data: UpdatePosterDto) => updateMutation.mutate({ id, data }),
    [updateMutation]
  );

  const deletePoster = useCallback(
    async (id: string) => {
      await deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  const exportPoster = useCallback(
    (id: string, data: ExportPosterDto) => exportMutation.mutate({ id, data }),
    [exportMutation]
  );

  return {
    posters: posters ?? [],
    isLoading,
    error,
    refetch,
    createPoster,
    updatePoster,
    deletePoster,
    exportPoster,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isExporting: exportMutation.isLoading,
  };
}

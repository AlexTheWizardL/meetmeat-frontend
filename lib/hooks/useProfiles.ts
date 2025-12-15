/**
 * useProfiles - Hook for profile management with optimistic updates
 */

import { useCallback } from 'react';
import { profilesApi } from '@/lib/api';
import { useAsync } from './useAsync';
import { useMutation } from './useMutation';
import type { Profile, CreateProfileDto, UpdateProfileDto } from '@/types';

export interface UseProfilesResult {
  profiles: Profile[];
  defaultProfile: Profile | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createProfile: (data: CreateProfileDto) => Promise<Profile>;
  updateProfile: (id: string, data: UpdateProfileDto) => Promise<Profile>;
  deleteProfile: (id: string) => Promise<void>;
  setDefaultProfile: (id: string) => Promise<Profile>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function useProfiles(): UseProfilesResult {
  const {
    data: profiles,
    isLoading,
    error,
    refetch,
    setData: setProfiles,
  } = useAsync(() => profilesApi.getAll(), []);

  const createMutation = useMutation(
    (data: CreateProfileDto) => profilesApi.create(data),
    {
      onSuccess: (newProfile) => {
        setProfiles((prev) => (prev ? [...prev, newProfile] : [newProfile]));
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: UpdateProfileDto }) => profilesApi.update(id, data),
    {
      onSuccess: (updatedProfile) => {
        setProfiles((prev) =>
          prev?.map((p) => (p.id === updatedProfile.id ? updatedProfile : p)) ?? null
        );
      },
    }
  );

  const deleteMutation = useMutation(
    (id: string) => profilesApi.delete(id),
    {
      onSuccess: (_, id) => {
        setProfiles((prev) => prev?.filter((p) => p.id !== id) ?? null);
      },
    }
  );

  const setDefaultMutation = useMutation(
    (id: string) => profilesApi.setDefault(id),
    {
      onSuccess: (updatedProfile) => {
        setProfiles((prev) =>
          prev?.map((p) => ({
            ...p,
            isDefault: p.id === updatedProfile.id,
          })) ?? null
        );
      },
    }
  );

  const createProfile = useCallback(
    (data: CreateProfileDto) => createMutation.mutate(data),
    [createMutation]
  );

  const updateProfile = useCallback(
    (id: string, data: UpdateProfileDto) => updateMutation.mutate({ id, data }),
    [updateMutation]
  );

  const deleteProfile = useCallback(
    async (id: string) => {
      await deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  const setDefaultProfile = useCallback(
    (id: string) => setDefaultMutation.mutate(id),
    [setDefaultMutation]
  );

  const defaultProfile = profiles?.find((p) => p.isDefault) ?? profiles?.[0] ?? null;

  return {
    profiles: profiles ?? [],
    defaultProfile,
    isLoading,
    error,
    refetch,
    createProfile,
    updateProfile,
    deleteProfile,
    setDefaultProfile,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
  };
}

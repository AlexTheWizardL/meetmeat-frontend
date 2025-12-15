/**
 * Profiles API - CRUD operations for user profiles
 */

import { apiClient } from './client';
import type { Profile, CreateProfileDto, UpdateProfileDto } from '@/types';

const ENDPOINT = '/profiles';

export const profilesApi = {
  /**
   * Get all profiles
   */
  async getAll(): Promise<Profile[]> {
    const response = await apiClient.get<Profile[]>(ENDPOINT);
    return response.data;
  },

  /**
   * Get profile by ID
   */
  async getById(id: string): Promise<Profile> {
    const response = await apiClient.get<Profile>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  /**
   * Get the default profile
   */
  async getDefault(): Promise<Profile | null> {
    const response = await apiClient.get<Profile | null>(`${ENDPOINT}/default`);
    return response.data;
  },

  /**
   * Create a new profile
   */
  async create(data: CreateProfileDto): Promise<Profile> {
    const response = await apiClient.post<Profile>(ENDPOINT, data);
    return response.data;
  },

  /**
   * Update an existing profile
   */
  async update(id: string, data: UpdateProfileDto): Promise<Profile> {
    const response = await apiClient.patch<Profile>(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  /**
   * Delete a profile (soft delete)
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${ENDPOINT}/${id}`);
  },

  /**
   * Set a profile as default
   */
  async setDefault(id: string): Promise<Profile> {
    const response = await apiClient.patch<Profile>(`${ENDPOINT}/${id}/default`);
    return response.data;
  },
};

/**
 * Posters API - Poster CRUD and export operations
 */

import { apiClient } from './client';
import type {
  Poster,
  CreatePosterDto,
  UpdatePosterDto,
  ExportPosterDto,
  ExportPlatform,
} from '@/types';

const ENDPOINT = '/posters';

export const postersApi = {
  /**
   * Get all posters (optionally filtered by profileId)
   */
  async getAll(profileId?: string): Promise<Poster[]> {
    const params = profileId ? `?profileId=${profileId}` : '';
    const response = await apiClient.get<Poster[]>(`${ENDPOINT}${params}`);
    return response.data;
  },

  /**
   * Get poster by ID
   */
  async getById(id: string): Promise<Poster> {
    const response = await apiClient.get<Poster>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  /**
   * Create a new poster
   */
  async create(data: CreatePosterDto): Promise<Poster> {
    const response = await apiClient.post<Poster>(ENDPOINT, data);
    return response.data;
  },

  /**
   * Update poster customizations
   */
  async update(id: string, data: UpdatePosterDto): Promise<Poster> {
    const response = await apiClient.patch<Poster>(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  /**
   * Export poster to a platform (generates image)
   */
  async export(id: string, data: ExportPosterDto): Promise<{ url: string; platform: ExportPlatform }> {
    const response = await apiClient.post<{ url: string; platform: ExportPlatform }>(
      `${ENDPOINT}/${id}/export`,
      data
    );
    return response.data;
  },

  /**
   * Delete a poster (soft delete)
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${ENDPOINT}/${id}`);
  },
};

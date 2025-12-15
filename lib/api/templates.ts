/**
 * Templates API - Template generation and management
 */

import { apiClient } from './client';
import type { Template, GenerateTemplatesDto } from '@/types';

const ENDPOINT = '/templates';

export const templatesApi = {
  /**
   * Generate templates for an event using AI
   */
  async generate(data: GenerateTemplatesDto): Promise<Template[]> {
    const response = await apiClient.post<Template[]>(`${ENDPOINT}/generate`, data);
    return response.data;
  },

  /**
   * Get all templates
   */
  async getAll(): Promise<Template[]> {
    const response = await apiClient.get<Template[]>(ENDPOINT);
    return response.data;
  },

  /**
   * Get templates for a specific event
   */
  async getByEventId(eventId: string): Promise<Template[]> {
    const response = await apiClient.get<Template[]>(`${ENDPOINT}?eventId=${eventId}`);
    return response.data;
  },

  /**
   * Get template by ID
   */
  async getById(id: string): Promise<Template> {
    const response = await apiClient.get<Template>(`${ENDPOINT}/${id}`);
    return response.data;
  },
};

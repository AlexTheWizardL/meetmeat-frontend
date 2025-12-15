/**
 * Events API - Event parsing and management
 */

import { apiClient } from './client';
import type { Event, ParseEventDto, CreateEventDto } from '@/types';

const ENDPOINT = '/events';

export const eventsApi = {
  /**
   * Parse event from URL using AI
   */
  async parse(data: ParseEventDto): Promise<Event> {
    const response = await apiClient.post<Event>(`${ENDPOINT}/parse`, data);
    return response.data;
  },

  /**
   * Get all events
   */
  async getAll(): Promise<Event[]> {
    const response = await apiClient.get<Event[]>(ENDPOINT);
    return response.data;
  },

  /**
   * Get event by ID
   */
  async getById(id: string): Promise<Event> {
    const response = await apiClient.get<Event>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  /**
   * Create event manually
   */
  async create(data: CreateEventDto): Promise<Event> {
    const response = await apiClient.post<Event>(ENDPOINT, data);
    return response.data;
  },
};

/**
 * Event types matching backend API
 */

export interface Event {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  venue?: string;
  sourceUrl?: string;
  logoUrl?: string;
  brandColors: string[];
  rawData?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ParseEventDto {
  url: string;
}

export interface CreateEventDto {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  venue?: string;
  sourceUrl?: string;
  logoUrl?: string;
  brandColors?: string[];
}

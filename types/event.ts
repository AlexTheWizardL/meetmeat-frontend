/**
 * Event types matching backend API
 */

export interface BrandColors {
  primary: string;
  secondary?: string;
  accent?: string;
  background?: string;
  text?: string;
}

export interface EventLocation {
  venue?: string;
  city?: string;
  country?: string;
  isVirtual: boolean;
}

export interface VisualStyle {
  style: 'modern' | 'classic' | 'minimal' | 'bold' | 'playful' | 'corporate';
  typography: {
    headingStyle: 'sans-serif' | 'serif' | 'display' | 'monospace';
    bodyStyle: 'sans-serif' | 'serif';
    weight: 'light' | 'regular' | 'bold' | 'heavy';
  };
  designElements: string[];
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: EventLocation;
  sourceUrl?: string;
  logoUrl?: string;
  brandColors?: BrandColors;
  organizerName?: string;
  visualStyle?: VisualStyle;
  heroImageUrl?: string;
  rawMetadata?: Record<string, unknown>;
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
  location?: EventLocation;
  sourceUrl?: string;
  logoUrl?: string;
  brandColors?: BrandColors;
}

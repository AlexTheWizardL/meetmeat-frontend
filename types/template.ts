/**
 * Template types matching backend API
 */

export type TemplateLayout = 'classic' | 'modern' | 'minimal' | 'bold';

export interface TemplateElementProperties {
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  fill?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
}

export interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'logo';
  properties: TemplateElementProperties;
}

export interface TemplateDesign {
  layout: TemplateLayout;
  backgroundColor: string;
  elements: TemplateElement[];
}

export interface Template {
  id: string;
  name: string;
  eventId?: string;
  design: TemplateDesign;
  previewImageUrl?: string;
  status: 'active' | 'archived';
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateTemplatesDto {
  eventId: string;
  count?: number;
}

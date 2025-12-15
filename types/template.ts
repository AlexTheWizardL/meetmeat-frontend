/**
 * Template types matching backend API
 */

export type TemplateStatus = 'generating' | 'ready' | 'failed';

export interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  color?: string;
  fontSize?: number;
  fontWeight?: string;
  imageUrl?: string;
  backgroundColor?: string;
}

export interface Template {
  id: string;
  name: string;
  eventId: string;
  layoutData: TemplateElement[];
  previewUrl?: string;
  status: TemplateStatus;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateTemplatesDto {
  eventId: string;
  count?: number;
}

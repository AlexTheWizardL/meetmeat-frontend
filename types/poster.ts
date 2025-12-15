/**
 * Poster types matching backend API
 */

import type { TemplateElement } from './template';

export type PosterStatus = 'draft' | 'exported';

export type ExportPlatform = 'linkedin' | 'instagram' | 'twitter' | 'facebook';

export interface ExportSize {
  width: number;
  height: number;
}

export const EXPORT_SIZES: Record<ExportPlatform, ExportSize> = {
  linkedin: { width: 1200, height: 627 },
  instagram: { width: 1080, height: 1080 },
  twitter: { width: 1200, height: 675 },
  facebook: { width: 1200, height: 630 },
};

export interface Poster {
  id: string;
  profileId: string;
  eventId: string;
  templateId: string;
  customizations: TemplateElement[];
  status: PosterStatus;
  exportedUrls: Partial<Record<ExportPlatform, string>>;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePosterDto {
  profileId: string;
  eventId: string;
  templateId: string;
  customizations?: TemplateElement[];
}

export interface UpdatePosterDto {
  customizations?: TemplateElement[];
  status?: PosterStatus;
}

export interface ExportPosterDto {
  platform: ExportPlatform;
}

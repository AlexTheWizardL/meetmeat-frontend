/**
 * Profile types matching backend API
 */

export type SocialPlatform =
  | 'linkedin'
  | 'twitter'
  | 'instagram'
  | 'facebook'
  | 'github'
  | 'website';

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

export interface Profile {
  id: string;
  name: string;
  title: string;
  company?: string;
  avatarUrl?: string;
  socialLinks: SocialLink[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfileDto {
  name: string;
  title: string;
  company?: string;
  avatarUrl?: string;
  socialLinks?: SocialLink[];
  isDefault?: boolean;
}

export interface UpdateProfileDto {
  name?: string;
  title?: string;
  company?: string;
  avatarUrl?: string;
  socialLinks?: SocialLink[];
  isDefault?: boolean;
}

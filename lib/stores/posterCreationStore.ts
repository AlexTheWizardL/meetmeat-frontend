import { create } from 'zustand';
import type { Profile, Event, Template } from '@/types';

interface UserDetails {
  name: string;
  title: string;
  company?: string;
}

interface EventDetails {
  name: string;
  date?: string;
  location?: string;
  brandColor?: string;
}

interface PosterCreationState {
  // State
  profile: Profile | null;
  userDetails: UserDetails | null;
  event: Event | null;
  eventDetails: EventDetails | null;
  eventUrl: string;
  templates: Template[];
  selectedTemplate: Template | null;

  // Actions
  setProfile: (profile: Profile | null) => void;
  setUserDetails: (details: UserDetails | null) => void;
  setEvent: (event: Event | null) => void;
  setEventDetails: (details: EventDetails | null) => void;
  setEventUrl: (url: string) => void;
  setTemplates: (templates: Template[]) => void;
  setSelectedTemplate: (template: Template | null) => void;
  reset: () => void;
}

const initialState = {
  profile: null,
  userDetails: null,
  event: null,
  eventDetails: null,
  eventUrl: '',
  templates: [],
  selectedTemplate: null,
};

export const usePosterCreationStore = create<PosterCreationState>((set) => ({
  ...initialState,

  setProfile: (profile) =>
    set((state) => ({
      profile,
      userDetails: profile
        ? { name: profile.name, title: profile.title, company: profile.company }
        : state.userDetails,
    })),

  setUserDetails: (userDetails) => set({ userDetails }),

  setEvent: (event) =>
    set((state) => ({
      event,
      eventDetails: event
        ? {
            name: event.name,
            date: event.startDate ? new Date(event.startDate).toLocaleDateString() : undefined,
            location: event.location
              ? [event.location.venue, event.location.city, event.location.country].filter(Boolean).join(', ')
              : undefined,
            brandColor: event.brandColors?.primary,
          }
        : state.eventDetails,
    })),

  setEventDetails: (eventDetails) => set({ eventDetails }),

  setEventUrl: (eventUrl) => set({ eventUrl }),

  setTemplates: (templates) =>
    set({
      templates,
      selectedTemplate: templates[0] ?? null,
    }),

  setSelectedTemplate: (selectedTemplate) => set({ selectedTemplate }),

  reset: () => set(initialState),
}));

// Selector hooks for better performance
export const useProfile = () => usePosterCreationStore((state) => state.profile);
export const useUserDetails = () => usePosterCreationStore((state) => state.userDetails);
export const useEvent = () => usePosterCreationStore((state) => state.event);
export const useEventDetails = () => usePosterCreationStore((state) => state.eventDetails);
export const useTemplates = () => usePosterCreationStore((state) => state.templates);
export const useSelectedTemplate = () => usePosterCreationStore((state) => state.selectedTemplate);

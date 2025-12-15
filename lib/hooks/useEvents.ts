/**
 * useEvents - Hook for event parsing and management
 */

import { useCallback } from 'react';
import { eventsApi } from '@/lib/api';
import { useMutation } from './useMutation';
import type { Event, ParseEventDto, CreateEventDto } from '@/types';

export interface UseEventsResult {
  parseEvent: (data: ParseEventDto) => Promise<Event>;
  createEvent: (data: CreateEventDto) => Promise<Event>;
  isParsing: boolean;
  isCreating: boolean;
  parseError: Error | null;
}

export function useEvents(): UseEventsResult {
  const parseMutation = useMutation((data: ParseEventDto) => eventsApi.parse(data));
  const createMutation = useMutation((data: CreateEventDto) => eventsApi.create(data));

  const parseEvent = useCallback(
    (data: ParseEventDto) => parseMutation.mutate(data),
    [parseMutation]
  );

  const createEvent = useCallback(
    (data: CreateEventDto) => createMutation.mutate(data),
    [createMutation]
  );

  return {
    parseEvent,
    createEvent,
    isParsing: parseMutation.isLoading,
    isCreating: createMutation.isLoading,
    parseError: parseMutation.error,
  };
}

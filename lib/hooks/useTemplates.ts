/**
 * useTemplates - Hook for template generation
 */

import { useCallback } from 'react';
import { templatesApi } from '@/lib/api';
import { useAsync } from './useAsync';
import { useMutation } from './useMutation';
import type { Template, GenerateTemplatesDto } from '@/types';

export interface UseTemplatesResult {
  templates: Template[];
  isLoading: boolean;
  error: Error | null;
  generateTemplates: (data: GenerateTemplatesDto) => Promise<Template[]>;
  isGenerating: boolean;
  fetchByEventId: (eventId: string) => Promise<void>;
}

export function useTemplates(eventId?: string): UseTemplatesResult {
  const {
    data: templates,
    isLoading,
    error,
    refetch: _refetch,
    setData: setTemplates,
  } = useAsync(
    () => (eventId ? templatesApi.getByEventId(eventId) : Promise.resolve([])),
    [eventId],
    { skip: !eventId }
  );

  const generateMutation = useMutation(
    (data: GenerateTemplatesDto) => templatesApi.generate(data),
    {
      onSuccess: (newTemplates) => {
        setTemplates(newTemplates);
      },
    }
  );

  const generateTemplates = useCallback(
    (data: GenerateTemplatesDto) => generateMutation.mutate(data),
    [generateMutation]
  );

  const fetchByEventId = useCallback(
    async (id: string) => {
      const result = await templatesApi.getByEventId(id);
      setTemplates(result);
    },
    [setTemplates]
  );

  return {
    templates: templates ?? [],
    isLoading,
    error,
    generateTemplates,
    isGenerating: generateMutation.isLoading,
    fetchByEventId,
  };
}

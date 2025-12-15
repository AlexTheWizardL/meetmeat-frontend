import { useState, useEffect, Suspense } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { usePosterCreationStore } from '@/lib/stores/posterCreationStore';
import { usePosters } from '@/lib/hooks';
import { Button } from '@/components/ui';
import { PosterCanvas } from '@/components/poster';
import { AsyncSkia } from '@/components/async-skia';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants';
import type { TemplateLayout } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PREVIEW_WIDTH = SCREEN_WIDTH - Spacing.lg * 2;
const PREVIEW_HEIGHT = PREVIEW_WIDTH * 1.2;

const getTextColor = (bgColor: string): string => {
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#1A1A2E' : '#FFFFFF';
};

function SkiaFallback() {
  return (
    <View style={[styles.posterPreview, styles.fallback]}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.fallbackText}>Loading canvas...</Text>
    </View>
  );
}

export default function EditorScreen() {
  const userDetails = usePosterCreationStore((s) => s.userDetails);
  const event = usePosterCreationStore((s) => s.event);
  const templates = usePosterCreationStore((s) => s.templates);
  const selectedTemplate = usePosterCreationStore((s) => s.selectedTemplate);
  const setSelectedTemplate = usePosterCreationStore((s) => s.setSelectedTemplate);
  const profile = usePosterCreationStore((s) => s.profile);

  const { createPoster, isCreating } = usePosters();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0] ?? null);
    }
  }, [templates, selectedTemplate, setSelectedTemplate]);

  const handleExport = async () => {
    if (!profile && !userDetails) {
      setError('Missing user details');
      return;
    }
    if (!event) {
      setError('Missing event');
      return;
    }

    try {
      await createPoster({
        profileId: profile?.id ?? 'temp-profile',
        eventId: event.id,
        templateId: selectedTemplate?.id ?? 'default',
      });
      router.push('/create/export');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create poster');
    }
  };

  const currentLayout: TemplateLayout = selectedTemplate?.design.layout ?? 'modern';
  const userName = userDetails?.name ?? profile?.name ?? 'Your Name';
  const userTitle = userDetails?.title ?? profile?.title ?? 'Your Title';
  const userCompany = userDetails?.company ?? profile?.company;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.preview}>
          <View style={styles.posterContainer}>
            <Suspense fallback={<SkiaFallback />}>
              <AsyncSkia />
              <PosterCanvas
                width={PREVIEW_WIDTH}
                height={PREVIEW_HEIGHT}
                event={event}
                user={{
                  name: userName,
                  title: userTitle,
                  company: userCompany,
                  photoUrl: profile?.avatarUrl,
                }}
                layout={currentLayout}
              />
            </Suspense>
          </View>
        </View>

        <View style={styles.templateSection}>
          <Text style={styles.sectionTitle}>Choose Template</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.templateList}
          >
            {templates.map((template) => {
              const bgColor = template.design.backgroundColor;
              const layoutLabel = template.design.layout.charAt(0).toUpperCase();
              return (
                <Pressable
                  key={template.id}
                  style={styles.templateThumb}
                  onPress={() => setSelectedTemplate(template)}
                >
                  <View
                    style={[
                      styles.templatePreview,
                      { backgroundColor: bgColor },
                      selectedTemplate?.id === template.id && styles.templatePreviewSelected,
                    ]}
                  >
                    <Text
                      style={[styles.templateLayoutLabel, { color: getTextColor(bgColor) }]}
                    >
                      {layoutLabel}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.templateName,
                      selectedTemplate?.id === template.id && styles.templateNameSelected,
                    ]}
                  >
                    {template.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>

      <View style={styles.footer}>
        <Button onPress={() => void handleExport()} loading={isCreating} fullWidth>
          Export Poster
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  preview: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  posterContainer: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  posterPreview: {
    width: PREVIEW_WIDTH,
    height: PREVIEW_HEIGHT,
  },
  fallback: {
    backgroundColor: Colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    ...Typography.body,
    color: Colors.muted,
    marginTop: Spacing.sm,
  },
  templateSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.sm,
  },
  templateList: {
    gap: Spacing.sm,
  },
  templateThumb: {
    width: 80,
    alignItems: 'center',
  },
  templatePreview: {
    width: 72,
    height: 86,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  templatePreviewSelected: {
    borderColor: Colors.text,
  },
  templateLayoutLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  templateName: {
    ...Typography.caption,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  templateNameSelected: {
    fontWeight: '600',
    color: Colors.text,
  },
  error: {
    ...Typography.body,
    color: Colors.danger,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { usePosterCreationStore } from '@/lib/stores/posterCreationStore';
import { usePosters } from '@/lib/hooks';
import { Button } from '@/components/ui';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants';
import type { TemplateDesign } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PREVIEW_WIDTH = SCREEN_WIDTH - Spacing.lg * 2;
const PREVIEW_HEIGHT = PREVIEW_WIDTH * 0.8;

// Helper to format date nicely
const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Get contrasting text color
const getTextColor = (bgColor: string): string => {
  // Simple luminance check
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#1A1A2E' : '#FFFFFF';
};

export default function EditorScreen() {
  const userDetails = usePosterCreationStore((s) => s.userDetails);
  const event = usePosterCreationStore((s) => s.event);
  const templates = usePosterCreationStore((s) => s.templates);
  const selectedTemplate = usePosterCreationStore((s) => s.selectedTemplate);
  const setSelectedTemplate = usePosterCreationStore((s) => s.setSelectedTemplate);
  const profile = usePosterCreationStore((s) => s.profile);

  const { createPoster, isCreating } = usePosters();
  const [error, setError] = useState<string | null>(null);

  // Auto-select first template if none selected
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

  // Get current design from selected template or use default
  const defaultBgColor = event?.brandColors[0] ?? Colors.primary;
  const design: TemplateDesign = selectedTemplate?.design ?? {
    layout: 'classic',
    backgroundColor: defaultBgColor,
    elements: [],
  };

  const textColor = getTextColor(design.backgroundColor);
  const userName = userDetails?.name ?? profile?.name ?? '';
  const userTitle = userDetails?.title ?? profile?.title ?? '';
  const userCompany = userDetails?.company ?? profile?.company ?? '';

  // Different layout styles based on template layout
  const renderPosterContent = () => {
    switch (design.layout) {
      case 'modern':
        return (
          <View style={styles.layoutModern}>
            <View style={styles.modernHeader}>
              <Text style={[styles.modernEventName, { color: textColor }]}>
                {event?.name ?? 'Event Name'}
              </Text>
              <Text style={[styles.modernDate, { color: textColor, opacity: 0.8 }]}>
                {formatDate(event?.startDate)}
                {event?.endDate && ` - ${formatDate(event.endDate)}`}
              </Text>
            </View>
            <View style={[styles.modernBadge, { backgroundColor: textColor }]}>
              <Text style={[styles.modernBadgeText, { color: design.backgroundColor }]}>
                I'm Attending!
              </Text>
            </View>
            <View style={styles.modernFooter}>
              <Text style={[styles.modernUserName, { color: textColor }]}>{userName}</Text>
              <Text style={[styles.modernUserTitle, { color: textColor, opacity: 0.7 }]}>
                {userTitle}{userCompany && ` @ ${userCompany}`}
              </Text>
            </View>
          </View>
        );

      case 'minimal':
        return (
          <View style={styles.layoutMinimal}>
            <Text style={[styles.minimalEventName, { color: textColor }]}>
              {event?.name ?? 'Event Name'}
            </Text>
            <Text style={[styles.minimalDate, { color: textColor, opacity: 0.6 }]}>
              {formatDate(event?.startDate)}
            </Text>
            <View style={styles.minimalDivider} />
            <Text style={[styles.minimalAttending, { color: textColor }]}>I'm Attending!</Text>
            <View style={styles.minimalUserSection}>
              <Text style={[styles.minimalUserName, { color: textColor }]}>{userName}</Text>
              <Text style={[styles.minimalUserTitle, { color: textColor, opacity: 0.6 }]}>
                {userTitle}
              </Text>
            </View>
          </View>
        );

      case 'bold':
        return (
          <View style={styles.layoutBold}>
            <Text style={[styles.boldEventName, { color: textColor }]}>
              {event?.name.toUpperCase() ?? 'EVENT NAME'}
            </Text>
            <View style={styles.boldCenter}>
              <Text style={[styles.boldAttending, { color: textColor }]}>I'M ATTENDING!</Text>
              <Text style={[styles.boldUserName, { color: textColor }]}>{userName}</Text>
            </View>
            <Text style={[styles.boldDate, { color: textColor, opacity: 0.8 }]}>
              {formatDate(event?.startDate)}
            </Text>
          </View>
        );

      case 'classic':
      default:
        return (
          <View style={styles.layoutClassic}>
            <Text style={[styles.classicEventName, { color: textColor }]}>
              {event?.name ?? 'Event Name'}
            </Text>
            <Text style={[styles.classicDate, { color: textColor, opacity: 0.8 }]}>
              {formatDate(event?.startDate)}
            </Text>
            <View style={[styles.classicDivider, { backgroundColor: textColor, opacity: 0.5 }]} />
            <Text style={[styles.classicAttending, { color: textColor }]}>I'm attending!</Text>
            <Text style={[styles.classicUserName, { color: textColor }]}>{userName}</Text>
            <Text style={[styles.classicUserTitle, { color: textColor, opacity: 0.8 }]}>
              {userTitle}{userCompany && ` @ ${userCompany}`}
            </Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.preview}>
          <View
            style={[
              styles.posterPreview,
              { backgroundColor: design.backgroundColor },
            ]}
          >
            {renderPosterContent()}
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
                    <Text style={[
                      styles.templateLayoutLabel,
                      { color: getTextColor(bgColor) }
                    ]}>
                      {layoutLabel}
                    </Text>
                  </View>
                  <Text style={[
                    styles.templateName,
                    selectedTemplate?.id === template.id && styles.templateNameSelected
                  ]}>
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
  posterPreview: {
    width: PREVIEW_WIDTH,
    height: PREVIEW_HEIGHT,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },

  // Classic layout
  layoutClassic: {
    flex: 1,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  classicEventName: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  classicDate: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  classicDivider: {
    width: 60,
    height: 2,
    marginVertical: Spacing.md,
  },
  classicAttending: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  classicUserName: {
    fontSize: 20,
    fontWeight: '700',
  },
  classicUserTitle: {
    fontSize: 14,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },

  // Modern layout
  layoutModern: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'space-between',
  },
  modernHeader: {
    alignItems: 'flex-start',
  },
  modernEventName: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  modernDate: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  modernBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  modernBadgeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  modernFooter: {
    alignItems: 'flex-start',
  },
  modernUserName: {
    fontSize: 18,
    fontWeight: '700',
  },
  modernUserTitle: {
    fontSize: 12,
    marginTop: 2,
  },

  // Minimal layout
  layoutMinimal: {
    flex: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minimalEventName: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 2,
  },
  minimalDate: {
    fontSize: 12,
    marginTop: Spacing.sm,
    letterSpacing: 1,
  },
  minimalDivider: {
    width: 40,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginVertical: Spacing.lg,
  },
  minimalAttending: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  minimalUserSection: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  minimalUserName: {
    fontSize: 16,
    fontWeight: '600',
  },
  minimalUserTitle: {
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.5,
  },

  // Bold layout
  layoutBold: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boldEventName: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 3,
    textAlign: 'center',
  },
  boldCenter: {
    alignItems: 'center',
  },
  boldAttending: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  boldUserName: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: Spacing.sm,
  },
  boldDate: {
    fontSize: 12,
    letterSpacing: 2,
  },

  // Template selection
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
    height: 56,
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

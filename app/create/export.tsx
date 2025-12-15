import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { usePosterCreationStore } from '@/lib/stores/posterCreationStore';
import { Button } from '@/components/ui';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants';
import type { ExportPlatform } from '@/types';
import { EXPORT_SIZES } from '@/types';

interface PlatformOption {
  id: ExportPlatform;
  name: string;
  dimensions: string;
  icon: string;
}

const PLATFORMS: PlatformOption[] = [
  { id: 'linkedin', name: 'LinkedIn', dimensions: '1200 × 627', icon: 'in' },
  { id: 'instagram', name: 'Instagram', dimensions: '1080 × 1080', icon: 'IG' },
  { id: 'twitter', name: 'Twitter/X', dimensions: '1200 × 675', icon: 'X' },
  { id: 'facebook', name: 'Facebook', dimensions: '1200 × 630', icon: 'f' },
];

export default function ExportScreen() {
  const eventDetails = usePosterCreationStore((s) => s.eventDetails);
  const reset = usePosterCreationStore((s) => s.reset);

  const [selectedPlatform, setSelectedPlatform] = useState<ExportPlatform>('linkedin');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const size = EXPORT_SIZES[selectedPlatform];
      const message = `I'm attending ${eventDetails?.name ?? 'an event'}! 🎉`;

      await Share.share({
        message,
        title: 'Share your poster',
      });

      Alert.alert(
        'Poster Ready!',
        `Your ${size.width}×${size.height} poster for ${PLATFORMS.find((p) => p.id === selectedPlatform)?.name} is ready to share.`,
        [
          {
            text: 'Create Another',
            onPress: () => {
              reset();
              router.replace('/(tabs)');
            },
          },
          {
            text: 'Done',
            onPress: () => {
              reset();
              router.replace('/(tabs)');
            },
          },
        ]
      );
    } catch {
      Alert.alert('Export Failed', 'Failed to export poster. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>Export Poster</Text>
        <Text style={styles.subtitle}>
          Select the platform to optimize your poster size
        </Text>

        <View style={styles.platforms}>
          {PLATFORMS.map((platform) => (
            <Pressable
              key={platform.id}
              style={[
                styles.platformCard,
                selectedPlatform === platform.id && styles.platformSelected,
              ]}
              onPress={() => setSelectedPlatform(platform.id)}
            >
              <View style={styles.platformIcon}>
                <Text style={styles.platformIconText}>{platform.icon}</Text>
              </View>
              <View style={styles.platformInfo}>
                <Text style={styles.platformName}>{platform.name}</Text>
                <Text style={styles.platformDimensions}>{platform.dimensions}</Text>
              </View>
              <View
                style={[
                  styles.radio,
                  selectedPlatform === platform.id && styles.radioSelected,
                ]}
              >
                {selectedPlatform === platform.id && (
                  <View style={styles.radioInner} />
                )}
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          variant="secondary"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          Back
        </Button>
        <Button
          onPress={() => void handleExport()}
          loading={isExporting}
          style={styles.exportButton}
        >
          Export & Share
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
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.muted,
    marginBottom: Spacing.xl,
  },
  platforms: {
    gap: Spacing.sm,
  },
  platformCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  platformSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  platformIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  platformIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  platformInfo: {
    flex: 1,
  },
  platformName: {
    ...Typography.body,
    fontWeight: '600',
  },
  platformDimensions: {
    ...Typography.caption,
    color: Colors.muted,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  backButton: {
    flex: 1,
  },
  exportButton: {
    flex: 2,
  },
});

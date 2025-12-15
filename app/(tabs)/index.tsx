import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AsyncSkia } from '@/components/async-skia';
import { Button, Input, Card } from '@/components/ui';
import { Colors, Spacing, Typography } from '@/constants';

export default function HomeScreen() {
  const [eventUrl, setEventUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGeneratePoster = () => {
    if (!eventUrl.trim()) return;
    setIsLoading(true);
    // TODO: Navigate to loading screen, then editor
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const handleSelectProfile = () => {
    // TODO: Open profile selector
  };

  const handleEnterManually = () => {
    // TODO: Navigate to manual form
  };

  const handleSeeAll = () => {
    // TODO: Navigate to history
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Load Skia on web */}
      <React.Suspense fallback={<ActivityIndicator />}>
        <AsyncSkia />
      </React.Suspense>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Text style={styles.title}>MeetMeAt</Text>
        <Text style={styles.subtitle}>
          Create branded conference posters for social media
        </Text>

        {/* Profile Selector */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Start</Text>
          <Text style={styles.sectionDescription}>
            Select a profile to auto-fill your details
          </Text>
          <Button variant="secondary" onPress={handleSelectProfile}>
            Select Profile
          </Button>
        </Card>

        {/* Event URL Input */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Event</Text>
          <Input
            placeholder="Paste event URL..."
            value={eventUrl}
            onChangeText={setEventUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <Button
            onPress={handleGeneratePoster}
            disabled={!eventUrl.trim()}
            loading={isLoading}
            fullWidth
          >
            Generate Poster
          </Button>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button variant="secondary" onPress={handleEnterManually} fullWidth>
            Enter Details Manually
          </Button>
        </Card>

        {/* Recent Posters */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent</Text>
            <Button variant="ghost" size="sm" onPress={handleSeeAll}>
              See all
            </Button>
          </View>
          <Text style={styles.emptyText}>No posters yet</Text>
        </View>
      </ScrollView>
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
    paddingBottom: Spacing.xxl,
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
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    ...Typography.bodySmall,
    color: Colors.muted,
    marginBottom: Spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    ...Typography.caption,
    marginHorizontal: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.muted,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
});

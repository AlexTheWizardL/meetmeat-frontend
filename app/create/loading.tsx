import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { usePosterCreationStore } from '@/lib/stores/posterCreationStore';
import { useEvents, useTemplates } from '@/lib/hooks';
import { Colors, Spacing, Typography } from '@/constants';

const LOADING_MESSAGES = [
  'Analyzing event page...',
  'Extracting event details...',
  'Generating poster designs...',
  'Applying brand colors...',
  'Almost there...',
];

export default function LoadingScreen() {
  const profile = usePosterCreationStore((s) => s.profile);
  const userDetails = usePosterCreationStore((s) => s.userDetails);
  const eventUrl = usePosterCreationStore((s) => s.eventUrl);
  const eventDetails = usePosterCreationStore((s) => s.eventDetails);
  const setEvent = usePosterCreationStore((s) => s.setEvent);
  const setUserDetails = usePosterCreationStore((s) => s.setUserDetails);
  const setTemplates = usePosterCreationStore((s) => s.setTemplates);

  const { parseEvent, createEvent } = useEvents();
  const { generateTemplates } = useTemplates();

  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const isGenerating = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const generate = async () => {
      // Prevent duplicate calls
      if (isGenerating.current) return;
      isGenerating.current = true;
      // Determine user details from profile or manual entry
      const finalUserDetails = userDetails ?? (profile ? {
        name: profile.name,
        title: profile.title,
        company: profile.company,
      } : null);

      if (!finalUserDetails) {
        isGenerating.current = false;
        router.replace('/create/your-details');
        return;
      }

      // Set user details if we got them from profile
      if (!userDetails && profile) {
        setUserDetails(finalUserDetails);
      }

      try {
        let event;

        // If we have an event URL, parse it with AI
        if (eventUrl) {
          event = await parseEvent({ url: eventUrl });
          setEvent(event);
        } else if (eventDetails) {
          // Manual entry flow - create event from form data
          event = await createEvent({
            name: eventDetails.name,
            startDate: eventDetails.date,
            location: eventDetails.location,
            brandColors: eventDetails.brandColor ? [eventDetails.brandColor] : undefined,
          });
          setEvent(event);
        } else {
          isGenerating.current = false;
          router.replace('/create/event-details');
          return;
        }

        const templates = await generateTemplates({
          eventId: event.id,
          count: 3,
        });

        setTemplates(templates);
        router.replace('/create/editor');
      } catch (err) {
        // Backend returns user-friendly messages, just display them
        const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
        setError(message);
        isGenerating.current = false;
      }
    };

    void generate();
    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorIcon}>!</Text>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Text
            style={styles.retryButton}
            onPress={() => router.replace('/create/event-details')}
          >
            Go Back
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={Colors.primary} style={styles.spinner} />
        <Text style={styles.title}>Creating Your Poster</Text>
        <Text style={styles.message}>{LOADING_MESSAGES[messageIndex]}</Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((messageIndex + 1) / LOADING_MESSAGES.length) * 100}%` },
            ]}
          />
        </View>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  spinner: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h2,
    marginBottom: Spacing.sm,
  },
  message: {
    ...Typography.body,
    color: Colors.muted,
    marginBottom: Spacing.xl,
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  errorIcon: {
    fontSize: 48,
    color: Colors.danger,
    marginBottom: Spacing.md,
  },
  errorTitle: {
    ...Typography.h2,
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    ...Typography.body,
    color: Colors.muted,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  retryButton: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
});

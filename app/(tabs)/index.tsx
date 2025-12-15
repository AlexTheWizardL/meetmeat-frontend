import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AsyncSkia } from '@/components/async-skia';
import { Button, Input, Card } from '@/components/ui';
import { ProfileSelector, ProfileFormModal } from '@/components/profiles';
import { useProfiles } from '@/lib/hooks/useProfiles';
import { usePosters } from '@/lib/hooks/usePosters';
import { usePosterCreationStore } from '@/lib/stores/posterCreationStore';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants';
import type { Profile, Poster, CreateProfileDto, UpdateProfileDto } from '@/types';

export default function HomeScreen() {
  const profile = usePosterCreationStore((s) => s.profile);
  const setProfile = usePosterCreationStore((s) => s.setProfile);
  const setEventUrl = usePosterCreationStore((s) => s.setEventUrl);
  const reset = usePosterCreationStore((s) => s.reset);

  const { profiles, createProfile } = useProfiles();
  const { posters, isLoading: postersLoading } = usePosters(profile?.id);

  const [eventUrl, setEventUrlLocal] = useState('');
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSelectProfile = (selectedProfile: Profile) => {
    setProfile(selectedProfile);
    setShowProfileSelector(false);
  };

  const handleCreateProfile = async (data: CreateProfileDto | UpdateProfileDto) => {
    // When creating from home screen, we always create (not update)
    const newProfile = await createProfile(data as CreateProfileDto);
    setProfile(newProfile);
    setShowProfileForm(false);
    setShowProfileSelector(false);
  };

  const handleGeneratePoster = () => {
    if (!eventUrl.trim() || !profile) return;
    setIsGenerating(true);

    // Reset but keep profile (user details come from profile)
    reset();
    setProfile(profile);
    setEventUrl(eventUrl.trim());

    // Go directly to loading - AI will parse event from URL
    router.push('/create/loading');
    setIsGenerating(false);
  };

  const handleEnterManually = () => {
    reset();
    // Manual flow: start from Your Details (or Event Details if profile selected)
    if (profile) {
      setProfile(profile);
      router.push('/create/event-details');
    } else {
      router.push('/create/your-details');
    }
  };

  const handleViewAllPosters = () => {
    router.push('/(tabs)/history');
  };

  const handlePosterPress = (_poster: Poster) => {
    // TODO: Navigate to poster detail
  };

  const recentPosters = posters.slice(0, 5);

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
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoIcon}>
              <View style={styles.logoSquare} />
              <View style={styles.logoSquareOverlap} />
            </View>
            <Text style={styles.title}>MeetMeAt</Text>
          </View>
          <Pressable style={styles.bellButton}>
            <Text style={styles.bellIcon}>○</Text>
          </Pressable>
        </View>

        {/* Quick Start Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Start</Text>
          <Text style={styles.sectionLabel}>SELECT PROFILE</Text>

          {/* Profile Selector Button */}
          <Pressable
            style={styles.profileSelector}
            onPress={() => setShowProfileSelector(true)}
          >
            {profile ? (
              <>
                <View style={styles.avatarContainer}>
                  {profile.avatarUrl ? (
                    <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                      <Text style={styles.avatarText}>
                        {profile.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{profile.name}</Text>
                  <Text style={styles.profileTitle}>
                    {profile.title}
                    {profile.company && ` @ ${profile.company}`}
                  </Text>
                </View>
                <Text style={styles.chevron}>▼</Text>
              </>
            ) : (
              <>
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarText}>?</Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>Select a profile</Text>
                  <Text style={styles.profileTitle}>Tap to choose</Text>
                </View>
                <Text style={styles.chevron}>▼</Text>
              </>
            )}
          </Pressable>

          {/* Event URL Input */}
          <Input
            placeholder="Paste event URL..."
            value={eventUrl}
            onChangeText={setEventUrlLocal}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          {/* Generate Button */}
          <Button
            onPress={handleGeneratePoster}
            disabled={!eventUrl.trim() || !profile}
            loading={isGenerating}
            fullWidth
            style={styles.generateButton}
          >
            Generate Poster
          </Button>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or enter manually</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Enter Manually Button */}
          <Button
            variant="secondary"
            onPress={handleEnterManually}
            fullWidth
            style={styles.manualButton}
          >
            Enter Details Manually
          </Button>
        </View>

        {/* Recent Posters Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Posters</Text>
            {recentPosters.length > 0 && (
              <Pressable onPress={handleViewAllPosters}>
                <Text style={styles.viewAllLink}>View All</Text>
              </Pressable>
            )}
          </View>

          {postersLoading ? (
            <ActivityIndicator color={Colors.primary} style={styles.loader} />
          ) : recentPosters.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.postersList}
            >
              {recentPosters.map((poster) => (
                <Pressable
                  key={poster.id}
                  style={styles.posterCard}
                  onPress={() => handlePosterPress(poster)}
                >
                  <View style={styles.posterImage}>
                    <View style={styles.posterPlaceholder}>
                      <Text style={styles.posterPlaceholderText}>P</Text>
                    </View>
                  </View>
                  <View style={styles.posterInfo}>
                    <Text style={styles.posterTitle} numberOfLines={1}>
                      Event Poster
                    </Text>
                    <Text style={styles.posterSubtitle} numberOfLines={1}>
                      {new Date(poster.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No posters yet</Text>
              <Text style={styles.emptySubtext}>
                Create your first poster to see it here
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* FAB Button */}
      <Pressable
        style={styles.fab}
        onPress={handleEnterManually}
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>

      {/* Profile Selector Modal */}
      <ProfileSelector
        visible={showProfileSelector}
        profiles={profiles}
        selectedProfile={profile}
        onSelect={handleSelectProfile}
        onClose={() => setShowProfileSelector(false)}
        onCreateNew={() => {
          setShowProfileSelector(false);
          setShowProfileForm(true);
        }}
      />

      {/* Profile Form Modal */}
      <ProfileFormModal
        visible={showProfileForm}
        onClose={() => setShowProfileForm(false)}
        onSave={handleCreateProfile}
      />
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    marginRight: Spacing.sm,
    position: 'relative',
  },
  logoSquare: {
    width: 20,
    height: 20,
    backgroundColor: Colors.primary,
    borderRadius: 6,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  logoSquareOverlap: {
    width: 20,
    height: 20,
    backgroundColor: Colors.primary,
    borderRadius: 6,
    position: 'absolute',
    bottom: 0,
    right: 0,
    opacity: 0.6,
  },
  title: {
    ...Typography.h1,
  },
  bellButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {
    fontSize: 20,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h2,
    marginBottom: Spacing.xs,
  },
  sectionLabel: {
    ...Typography.caption,
    color: Colors.muted,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  viewAllLink: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  profileSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  avatarContainer: {
    marginRight: Spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.muted,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...Typography.body,
    fontWeight: '600',
  },
  profileTitle: {
    ...Typography.bodySmall,
    color: Colors.muted,
  },
  chevron: {
    fontSize: 12,
    color: Colors.muted,
  },
  generateButton: {
    marginBottom: Spacing.lg,
  },
  manualButton: {
    marginBottom: Spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    ...Typography.caption,
    color: Colors.muted,
    marginHorizontal: Spacing.md,
  },
  postersList: {
    gap: Spacing.md,
  },
  posterCard: {
    width: 160,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  posterImage: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.primary,
  },
  posterPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterPlaceholderText: {
    fontSize: 32,
  },
  posterInfo: {
    padding: Spacing.sm,
  },
  posterTitle: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  posterSubtitle: {
    ...Typography.caption,
    color: Colors.muted,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.muted,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    ...Typography.caption,
    color: Colors.muted,
  },
  loader: {
    paddingVertical: Spacing.xl,
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: Colors.background,
    fontWeight: '300',
  },
});

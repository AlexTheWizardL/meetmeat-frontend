import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui';
import { ProfileCard, ProfileFormModal } from '@/components/profiles';
import { useProfiles } from '@/lib/hooks';
import { Colors, Spacing, Typography } from '@/constants';
import type { Profile, CreateProfileDto, UpdateProfileDto } from '@/types';

export default function ProfilesScreen() {
  const {
    profiles,
    isLoading,
    error,
    refetch,
    createProfile,
    updateProfile,
    deleteProfile,
    setDefaultProfile,
    isCreating,
    isUpdating,
    isDeleting,
  } = useProfiles();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    void refetch().finally(() => setIsRefreshing(false));
  };

  const handleAddProfile = () => {
    setSelectedProfile(null);
    setModalVisible(true);
  };

  const handleEditProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setModalVisible(true);
  };

  const handleLongPress = (profile: Profile) => {
    Alert.alert(profile.name, 'Choose an action', [
      {
        text: profile.isDefault ? 'Already default' : 'Set as default',
        onPress: () => {
          if (!profile.isDefault) {
            void setDefaultProfile(profile.id);
          }
        },
        style: profile.isDefault ? 'cancel' : 'default',
      },
      {
        text: 'Edit',
        onPress: () => handleEditProfile(profile),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const handleSave = async (data: CreateProfileDto | UpdateProfileDto) => {
    try {
      if (selectedProfile) {
        await updateProfile(selectedProfile.id, data);
      } else {
        await createProfile(data as CreateProfileDto);
      }
      setModalVisible(false);
    } catch {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  const handleDelete = () => {
    if (!selectedProfile) return;

    Alert.alert(
      'Delete Profile',
      `Are you sure you want to delete "${selectedProfile.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteProfile(selectedProfile.id)
              .then(() => setModalVisible(false))
              .catch(() => Alert.alert('Error', 'Failed to delete profile.'));
          },
        },
      ]
    );
  };

  if (isLoading && profiles.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error && profiles.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Failed to load profiles</Text>
          <Button onPress={() => void refetch()}>Try Again</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profiles</Text>
        <Button variant="primary" size="sm" onPress={handleAddProfile}>
          + Add
        </Button>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {profiles.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No profiles yet</Text>
            <Text style={styles.emptyDescription}>
              Create a profile to auto-fill your details when generating posters
            </Text>
            <View style={styles.emptyAction}>
              <Button onPress={handleAddProfile}>Create Profile</Button>
            </View>
          </View>
        ) : (
          profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onPress={() => handleEditProfile(profile)}
              onLongPress={() => handleLongPress(profile)}
            />
          ))
        )}
      </ScrollView>

      <ProfileFormModal
        visible={modalVisible}
        profile={selectedProfile}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        onDelete={selectedProfile ? handleDelete : undefined}
        isSaving={isCreating || isUpdating}
        isDeleting={isDeleting}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  errorText: {
    ...Typography.body,
    color: Colors.danger,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    ...Typography.h1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingTop: 0,
    paddingBottom: Spacing.xxl,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.muted,
    marginBottom: Spacing.xs,
  },
  emptyDescription: {
    ...Typography.body,
    color: Colors.muted,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyAction: {
    marginTop: Spacing.lg,
  },
});

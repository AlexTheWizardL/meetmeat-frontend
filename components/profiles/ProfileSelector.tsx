import { Modal, View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants';
import { ProfileCard } from './ProfileCard';
import type { Profile } from '@/types';

interface ProfileSelectorProps {
  visible: boolean;
  profiles: Profile[];
  selectedProfile: Profile | null;
  onSelect: (profile: Profile) => void;
  onClose: () => void;
  onCreateNew: () => void;
}

export function ProfileSelector({
  visible,
  profiles,
  selectedProfile,
  onSelect,
  onClose,
  onCreateNew,
}: ProfileSelectorProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.closeButton}>Cancel</Text>
          </Pressable>
          <Text style={styles.title}>Select Profile</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {profiles.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No profiles yet</Text>
              <Text style={styles.emptyDescription}>
                Create a profile to get started
              </Text>
            </View>
          ) : (
            profiles.map((profile) => (
              <Pressable
                key={profile.id}
                onPress={() => onSelect(profile)}
                style={[
                  styles.profileWrapper,
                  selectedProfile?.id === profile.id && styles.selected,
                ]}
              >
                <ProfileCard
                  profile={profile}
                  onPress={() => onSelect(profile)}
                />
              </Pressable>
            ))
          )}

          <Pressable style={styles.createNew} onPress={onCreateNew}>
            <Text style={styles.createNewIcon}>+</Text>
            <Text style={styles.createNewText}>Create New Profile</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    ...Typography.body,
    color: Colors.primary,
  },
  title: {
    ...Typography.h3,
  },
  headerRight: {
    width: 50,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  profileWrapper: {
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  selected: {
    backgroundColor: Colors.primary + '10',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.muted,
  },
  emptyDescription: {
    ...Typography.body,
    color: Colors.muted,
    marginTop: Spacing.xs,
  },
  createNew: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    marginTop: Spacing.md,
  },
  createNewIcon: {
    fontSize: 24,
    color: Colors.primary,
    marginRight: Spacing.xs,
  },
  createNewText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
});

import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui';
import { Colors, Spacing, Typography } from '@/constants';

export default function ProfilesScreen() {
  const handleAddProfile = () => {
    // TODO: Open profile form modal
  };

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
      >
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No profiles yet</Text>
          <Text style={styles.emptyDescription}>
            Create a profile to auto-fill your details when generating posters
          </Text>
          <View style={styles.emptyAction}>
            <Button onPress={handleAddProfile}>Create Profile</Button>
          </View>
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

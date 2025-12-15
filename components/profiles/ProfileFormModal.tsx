import { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, Spacing, Typography } from '@/constants';
import { Button, Input } from '@/components/ui';
import type { Profile, CreateProfileDto, UpdateProfileDto } from '@/types';

interface ProfileFormModalProps {
  visible: boolean;
  profile?: Profile | null;
  onClose: () => void;
  onSave: (data: CreateProfileDto | UpdateProfileDto) => Promise<void>;
  onDelete?: () => void;
  isSaving?: boolean;
  isDeleting?: boolean;
}

export function ProfileFormModal({
  visible,
  profile,
  onClose,
  onSave,
  onDelete,
  isSaving = false,
  isDeleting = false,
}: ProfileFormModalProps) {
  const isEditing = !!profile;
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) {
      if (profile) {
        setName(profile.name);
        setTitle(profile.title);
        setCompany(profile.company ?? '');
      } else {
        setName('');
        setTitle('');
        setCompany('');
      }
      setErrors({});
    }
  }, [visible, profile]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!title.trim()) newErrors.title = 'Title is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const data: CreateProfileDto | UpdateProfileDto = {
      name: name.trim(),
      title: title.trim(),
      company: company.trim() || undefined,
    };

    void onSave(data);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </Pressable>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Profile' : 'New Profile'}
          </Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Input
            label="Name"
            placeholder="Your full name"
            value={name}
            onChangeText={setName}
            error={errors.name}
            autoCapitalize="words"
            autoCorrect={false}
          />

          <Input
            label="Title"
            placeholder="e.g., Software Engineer"
            value={title}
            onChangeText={setTitle}
            error={errors.title}
            autoCapitalize="words"
          />

          <Input
            label="Company (optional)"
            placeholder="Where do you work?"
            value={company}
            onChangeText={setCompany}
            autoCapitalize="words"
          />

          <View style={styles.actions}>
            <Button onPress={handleSave} loading={isSaving} fullWidth>
              {isEditing ? 'Save Changes' : 'Create Profile'}
            </Button>

            {isEditing && onDelete && (
              <Button
                variant="danger"
                onPress={onDelete}
                loading={isDeleting}
                fullWidth
              >
                Delete Profile
              </Button>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  cancelButton: {
    ...Typography.body,
    color: Colors.primary,
  },
  headerTitle: {
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
  },
  actions: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
});

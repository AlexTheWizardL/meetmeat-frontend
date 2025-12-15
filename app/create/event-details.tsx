import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Input } from '@/components/ui';
import { StepContainer } from '@/components/create/StepContainer';
import { usePosterCreationStore } from '@/lib/stores/posterCreationStore';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants';

const PRESET_COLORS = ['#6C5CE7', '#E74C3C', '#27AE60', '#F39C12', '#3498DB', '#1A1A2E'];

export default function EventDetailsScreen() {
  const eventDetails = usePosterCreationStore((s) => s.eventDetails);
  const event = usePosterCreationStore((s) => s.event);
  const setEventDetails = usePosterCreationStore((s) => s.setEventDetails);

  const [name, setName] = useState(eventDetails?.name ?? event?.name ?? '');
  const [date, setDate] = useState(eventDetails?.date ?? '');
  const [location, setLocation] = useState(eventDetails?.location ?? event?.location ?? '');
  const [brandColor, setBrandColor] = useState(
    eventDetails?.brandColor ?? (event?.brandColors && event.brandColors.length > 0 ? event.brandColors[0] : PRESET_COLORS[0])
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (event) {
      setName(event.name);
      setLocation(event.location ?? '');
      if (event.startDate) {
        setDate(new Date(event.startDate).toLocaleDateString());
      }
      if (event.brandColors.length > 0) {
        setBrandColor(event.brandColors[0]);
      }
    }
  }, [event]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Event name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;

    setEventDetails({
      name: name.trim(),
      date: date.trim() || undefined,
      location: location.trim() || undefined,
      brandColor,
    });

    router.push('/create/loading');
  };

  const isValid = name.trim();

  return (
    <StepContainer
      step={2}
      totalSteps={3}
      title="Event Details"
      subtitle="Tell us about the event you're attending"
      onNext={handleNext}
      nextLabel="Generate Poster"
      nextDisabled={!isValid}
    >
      <Input
        label="Event Name"
        placeholder="e.g., React Summit 2025"
        value={name}
        onChangeText={setName}
        error={errors.name}
        autoCapitalize="words"
      />

      <Input
        label="Date (optional)"
        placeholder="e.g., March 15-17, 2025"
        value={date}
        onChangeText={setDate}
      />

      <Input
        label="Location (optional)"
        placeholder="e.g., Amsterdam, Netherlands"
        value={location}
        onChangeText={setLocation}
        autoCapitalize="words"
      />

      <View style={styles.colorSection}>
        <Text style={styles.colorLabel}>Brand Color</Text>
        <View style={styles.colorGrid}>
          {PRESET_COLORS.map((color) => (
            <Pressable
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                brandColor === color && styles.colorSelected,
              ]}
              onPress={() => setBrandColor(color)}
            />
          ))}
        </View>
      </View>
    </StepContainer>
  );
}

const styles = StyleSheet.create({
  colorSection: {
    marginTop: Spacing.md,
  },
  colorLabel: {
    ...Typography.bodySmall,
    fontWeight: '500',
    marginBottom: Spacing.xs,
    color: Colors.text,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: Colors.text,
  },
});

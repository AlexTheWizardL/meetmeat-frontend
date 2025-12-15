import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Input } from '@/components/ui';
import { StepContainer } from '@/components/create/StepContainer';
import { usePosterCreationStore } from '@/lib/stores/posterCreationStore';

export default function YourDetailsScreen() {
  const userDetails = usePosterCreationStore((s) => s.userDetails);
  const setUserDetails = usePosterCreationStore((s) => s.setUserDetails);

  const [name, setName] = useState(userDetails?.name ?? '');
  const [title, setTitle] = useState(userDetails?.title ?? '');
  const [company, setCompany] = useState(userDetails?.company ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (userDetails) {
      setName(userDetails.name);
      setTitle(userDetails.title);
      setCompany(userDetails.company ?? '');
    }
  }, [userDetails]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!title.trim()) newErrors.title = 'Title is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;

    setUserDetails({
      name: name.trim(),
      title: title.trim(),
      company: company.trim() || undefined,
    });

    router.push('/create/event-details');
  };

  const isValid = name.trim() && title.trim();

  return (
    <StepContainer
      step={1}
      totalSteps={3}
      title="Your Details"
      subtitle="How should we identify you on the poster?"
      onNext={handleNext}
      nextDisabled={!isValid}
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
    </StepContainer>
  );
}

import { Stack } from 'expo-router';
import { Colors } from '@/constants';

export default function CreateLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.primary,
        headerBackTitle: 'Back',
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen
        name="your-details"
        options={{ title: 'Your Details', headerBackTitle: 'Home' }}
      />
      <Stack.Screen
        name="event-details"
        options={{ title: 'Event Details' }}
      />
      <Stack.Screen
        name="loading"
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="editor"
        options={{ title: 'Edit Poster' }}
      />
      <Stack.Screen
        name="export"
        options={{ title: 'Export', presentation: 'modal' }}
      />
    </Stack>
  );
}

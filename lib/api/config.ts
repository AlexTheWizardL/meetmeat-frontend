/**
 * API Configuration
 * Backend runs on port 3000 by default
 */

import { Platform } from 'react-native';

// For web development, localhost works directly
// For mobile emulators/simulators:
// - iOS Simulator: localhost works
// - Android Emulator: use 10.0.2.2 (maps to host machine localhost)
const getBaseUrl = (): string => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  // Web and iOS
  return 'http://localhost:3000';
};

export const API_CONFIG = {
  baseUrl: getBaseUrl(),
  timeout: 60000, // 60 seconds - AI operations can take longer
} as const;

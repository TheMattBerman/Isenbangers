import '@testing-library/jest-native/extend-expect';

// Mock expo modules that might not be available in test environment
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
}));

jest.mock('date-fns', () => ({
  format: jest.fn((date, formatString) => {
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  }),
}));

// Mock NativeWind CSS imports
jest.mock('react-native-css-interop', () => ({
  setupReactNative: jest.fn(),
}));
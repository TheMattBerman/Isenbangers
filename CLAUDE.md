# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server
npm start            # Expo development server
npm run ios          # Run on iOS simulator  
npm run android      # Run on Android emulator
npm run web          # Run in web browser

# Build and Development
bun install          # Install dependencies (uses bun, not npm)
npx expo install     # Install Expo-specific dependencies
```

## Linting and Code Quality

```bash
# The project uses ESLint with Prettier
# No specific lint/typecheck scripts are defined in package.json
# TypeScript strict mode is enabled in tsconfig.json
```

## Architecture Overview

### Project Structure
This is a React Native Expo app using TypeScript with the following key architectural patterns:

- **State Management**: Zustand with AsyncStorage persistence (`src/state/appStore.ts`)
- **Navigation**: React Navigation with bottom tabs (Daily, Spin Wheel, Library)
- **Styling**: NativeWind (Tailwind CSS for React Native) with custom theme
- **AI Integration**: Multiple AI providers (OpenAI, Anthropic, Grok) with unified interface

### Core Components Architecture

**Main App Flow**:
- `App.tsx` → `AppNavigator.tsx` → Screen components
- Three main screens: `DailyBangerScreen`, `SpinWheelScreen`, `LibraryScreen`
- Persistent state via Zustand store with streak tracking and favorites

**Key Patterns**:
- Daily content system with 24-hour countdown timer
- Streak tracking with modal rewards
- Audio playback with mini-player controls
- Progress tracking with visual progress bars

### AI Services Integration

The app has pre-built AI clients in `src/api/`:
- `chat-service.ts`: Unified interface for text generation and image analysis
- `anthropic.ts`: Anthropic Claude API client  
- `openai.ts`: OpenAI API client with latest models
- `grok.ts`: Grok API client
- `transcribe-audio.ts`: Audio transcription using OpenAI
- `image-generation.ts`: Image generation using OpenAI's gpt-image-1 model

### Environment Configuration

Environment variables use the pattern `process.env.EXPO_PUBLIC_VIBECODE_{KEY}`:
```typescript
// Correct usage
const apiKey = process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY;

// Avoid deprecated patterns
// import { API_KEY } from '@env';  // Don't use
// Constants.expoConfig.extra.apikey;  // Don't use
```

### Data Management

- **Bangers**: Mock data in `src/data/bangers.ts` with daily selection algorithm
- **State**: Zustand store persists user progress, streaks, favorites
- **Storage**: AsyncStorage for React Native persistence

### UI/UX Patterns

- **Theme**: Orange accent color (#f97316) with dark/light mode support
- **Components**: Reusable cards, modals, progress indicators
- **Audio**: Mini-player with waveform visualization and scrubbing
- **Haptics**: Expo Haptics integration throughout user interactions

### Special Implementation Notes

**Camera Implementation** (if needed):
```typescript
// Use modern CameraView API, not deprecated Camera
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
// Use direct styles, not className for camera view
<CameraView style={{ flex: 1 }} facing={facing} />
```

**Audio Transcription**:
- Use pre-built `transcribeAudio` function from `src/api/transcribe-audio.ts`
- Uses OpenAI's 'gpt-4o-transcribe' model

**Image Generation**:
- Use pre-built `generateImage` function from `src/api/image-generation.ts`  
- Uses OpenAI's 'gpt-image-1' model

## Key Files

- `src/state/appStore.ts`: Central state management with persistence
- `src/navigation/AppNavigator.tsx`: Main navigation structure
- `src/api/chat-service.ts`: AI integration interface
- `src/utils/cn.ts`: Tailwind class merging utility
- `src/data/bangers.ts`: Content data and daily selection logic
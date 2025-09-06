import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Audio } from 'expo-av';

// Mock all dependencies before importing the component
jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
    Sound: {
      createAsync: jest.fn(),
    },
    INTERRUPTION_MODE_IOS_DO_NOT_MIX: 'do_not_mix_ios',
    INTERRUPTION_MODE_ANDROID_DO_NOT_MIX: 'do_not_mix_android',
  },
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

jest.mock('../utils/waveformUtils', () => ({
  generateMockWaveform: jest.fn(() => ({
    peaks: [0.5, 0.8, 0.3, 0.9, 0.6, 0.4, 0.7, 0.2],
    duration: 120,
    sampleRate: 1,
  })),
  getWaveformData: jest.fn(() => Promise.resolve({
    peaks: [0.5, 0.8, 0.3, 0.9, 0.6, 0.4, 0.7, 0.2],
    duration: 120,
    sampleRate: 1,
  })),
  calculateTimeFromPosition: jest.fn((x, width, duration) => (x / width) * duration),
  calculatePositionFromTime: jest.fn((time, duration, width) => (time / duration) * width),
  formatTime: jest.fn((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }),
  calculateProgress: jest.fn((current, total) => current / total),
}));

// Import component after mocks
import AudioPlayer from './AudioPlayer';

describe('AudioPlayer', () => {
  const mockSound = {
    unloadAsync: jest.fn(() => Promise.resolve()),
    getStatusAsync: jest.fn(() => Promise.resolve({
      isLoaded: true,
      durationMillis: 120000, // 2 minutes
      positionMillis: 0,
      isPlaying: false,
    })),
    setOnPlaybackStatusUpdate: jest.fn(),
    playAsync: jest.fn(() => Promise.resolve()),
    pauseAsync: jest.fn(() => Promise.resolve()),
    setPositionAsync: jest.fn(() => Promise.resolve()),
    setRateAsync: jest.fn(() => Promise.resolve()),
  };

  const defaultProps = {
    audioUrl: 'https://example.com/audio.mp3',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (Audio.Sound.createAsync as jest.Mock).mockResolvedValue({
      sound: mockSound,
    });
  });

  describe('Component Rendering', () => {
    it('renders play button when not playing', async () => {
      render(<AudioPlayer {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Play audio')).toBeTruthy();
      });
    });

    it('renders time displays', async () => {
      render(<AudioPlayer {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('currentTime')).toBeTruthy();
        expect(screen.getByTestId('totalTime')).toBeTruthy();
      });
    });

    it('renders waveform scrubber', async () => {
      render(<AudioPlayer {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Audio waveform scrubber')).toBeTruthy();
      });
    });

    it('renders speed toggle', async () => {
      render(<AudioPlayer {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Playback speed 1x')).toBeTruthy();
      });
    });
  });

  describe('Audio Loading', () => {
    it('loads audio on mount', async () => {
      render(<AudioPlayer {...defaultProps} />);
      
      await waitFor(() => {
        expect(Audio.setAudioModeAsync).toHaveBeenCalled();
        expect(Audio.Sound.createAsync).toHaveBeenCalledWith(
          { uri: defaultProps.audioUrl },
          expect.objectContaining({
            shouldPlay: false,
            positionMillis: 0,
            rate: 1.0,
          })
        );
      });
    });

    it('handles initial position', async () => {
      const initialPosition = 30;
      render(<AudioPlayer {...defaultProps} initialPosition={initialPosition} />);
      
      await waitFor(() => {
        expect(Audio.Sound.createAsync).toHaveBeenCalledWith(
          { uri: defaultProps.audioUrl },
          expect.objectContaining({
            positionMillis: initialPosition * 1000,
          })
        );
      });
    });

    it('shows loading state initially', () => {
      render(<AudioPlayer {...defaultProps} />);
      
      // The component should show processing text while loading waveform
      expect(screen.queryByText('Processing audio...')).toBeTruthy();
    });
  });

  describe('Play/Pause Functionality', () => {
    it('plays audio when play button is pressed', async () => {
      render(<AudioPlayer {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Play audio')).toBeTruthy();
      });
      
      const playButton = screen.getByLabelText('Play audio');
      fireEvent.press(playButton);
      
      await waitFor(() => {
        expect(mockSound.playAsync).toHaveBeenCalled();
      });
    });

    it('pauses audio when pause button is pressed', async () => {
      render(<AudioPlayer {...defaultProps} />);
      
      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByLabelText('Play audio')).toBeTruthy();
      });
      
      // Simulate audio playing state
      act(() => {
        const statusCallback = mockSound.setOnPlaybackStatusUpdate.mock.calls[0][0];
        statusCallback({
          isLoaded: true,
          isPlaying: true,
          positionMillis: 5000,
          durationMillis: 120000,
        });
      });
      
      await waitFor(() => {
        expect(screen.getByLabelText('Pause audio')).toBeTruthy();
      });
      
      const pauseButton = screen.getByLabelText('Pause audio');
      fireEvent.press(pauseButton);
      
      await waitFor(() => {
        expect(mockSound.pauseAsync).toHaveBeenCalled();
      });
    });

    it('calls onPlay callback when playing', async () => {
      const onPlayMock = jest.fn();
      render(<AudioPlayer {...defaultProps} onPlay={onPlayMock} />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Play audio')).toBeTruthy();
      });
      
      const playButton = screen.getByLabelText('Play audio');
      fireEvent.press(playButton);
      
      await waitFor(() => {
        expect(onPlayMock).toHaveBeenCalled();
      });
    });

    it('calls onPause callback when pausing', async () => {
      const onPauseMock = jest.fn();
      render(<AudioPlayer {...defaultProps} onPause={onPauseMock} />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Play audio')).toBeTruthy();
      });
      
      // First start playing
      const playButton = screen.getByLabelText('Play audio');
      fireEvent.press(playButton);
      
      // Simulate playing state
      act(() => {
        const statusCallback = mockSound.setOnPlaybackStatusUpdate.mock.calls[0][0];
        statusCallback({
          isLoaded: true,
          isPlaying: true,
          positionMillis: 5000,
          durationMillis: 120000,
        });
      });
      
      await waitFor(() => {
        expect(screen.getByLabelText('Pause audio')).toBeTruthy();
      });
      
      // Then pause
      const pauseButton = screen.getByLabelText('Pause audio');
      fireEvent.press(pauseButton);
      
      await waitFor(() => {
        expect(onPauseMock).toHaveBeenCalled();
      });
    });
  });

  describe('Seeking Functionality', () => {
    it('seeks to position when waveform is tapped', async () => {
      render(<AudioPlayer {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Audio waveform scrubber')).toBeTruthy();
      });
      
      const waveform = screen.getByLabelText('Audio waveform scrubber');
      
      // Mock the layout event to set container width
      fireEvent(waveform, 'layout', {
        nativeEvent: { layout: { width: 300, height: 60 } }
      });
      
      // Simulate tap gesture
      fireEvent(waveform, 'onGestureEvent', {
        nativeEvent: { x: 150 } // Middle of the waveform
      });
      
      await waitFor(() => {
        expect(mockSound.setPositionAsync).toHaveBeenCalled();
      });
    });
  });

  describe('Speed Control', () => {
    it('shows speed menu when speed button is pressed', async () => {
      render(<AudioPlayer {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Playback speed 1x')).toBeTruthy();
      });
      
      const speedButton = screen.getByLabelText('Playback speed 1x');
      fireEvent.press(speedButton);
      
      await waitFor(() => {
        expect(screen.getByText('1.25x')).toBeTruthy();
        expect(screen.getByText('1.5x')).toBeTruthy();
      });
    });

    it('changes playback speed when speed option is selected', async () => {
      render(<AudioPlayer {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Playback speed 1x')).toBeTruthy();
      });
      
      // Open speed menu
      const speedButton = screen.getByLabelText('Playback speed 1x');
      fireEvent.press(speedButton);
      
      await waitFor(() => {
        expect(screen.getByText('1.25x')).toBeTruthy();
      });
      
      // Select 1.25x speed
      const speed125Button = screen.getByText('1.25x');
      fireEvent.press(speed125Button);
      
      await waitFor(() => {
        expect(mockSound.setRateAsync).toHaveBeenCalledWith(1.25, true);
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels', async () => {
      render(<AudioPlayer {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Play audio')).toBeTruthy();
        expect(screen.getByLabelText('Audio waveform scrubber')).toBeTruthy();
        expect(screen.getByLabelText('Playback speed 1x')).toBeTruthy();
      });
    });

    it('has testIDs for time displays', async () => {
      render(<AudioPlayer {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('currentTime')).toBeTruthy();
        expect(screen.getByTestId('totalTime')).toBeTruthy();
      });
    });
  });

  describe('Completion Handling', () => {
    it('calls onComplete callback when audio finishes', async () => {
      const onCompleteMock = jest.fn();
      render(<AudioPlayer {...defaultProps} onComplete={onCompleteMock} />);
      
      await waitFor(() => {
        expect(mockSound.setOnPlaybackStatusUpdate).toHaveBeenCalled();
      });
      
      // Simulate audio completion
      act(() => {
        const statusCallback = mockSound.setOnPlaybackStatusUpdate.mock.calls[0][0];
        statusCallback({
          isLoaded: true,
          isPlaying: false,
          positionMillis: 120000,
          durationMillis: 120000,
          didJustFinish: true,
        });
      });
      
      await waitFor(() => {
        expect(onCompleteMock).toHaveBeenCalled();
      });
    });
  });

  describe('Cleanup', () => {
    it('cleans up audio resources on unmount', async () => {
      const { unmount } = render(<AudioPlayer {...defaultProps} />);
      
      await waitFor(() => {
        expect(Audio.Sound.createAsync).toHaveBeenCalled();
      });
      
      unmount();
      
      expect(mockSound.unloadAsync).toHaveBeenCalled();
    });
  });
});
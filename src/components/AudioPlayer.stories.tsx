import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import AudioPlayer from './AudioPlayer';

const meta: Meta<typeof AudioPlayer> = {
  title: 'Components/AudioPlayer',
  component: AudioPlayer,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 16, backgroundColor: '#f3f4f6' }}>
        <Story />
      </View>
    ),
  ],
  args: {
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    initialPosition: 0,
  },
  argTypes: {
    audioUrl: {
      control: 'text',
    },
    initialPosition: {
      control: { type: 'number', min: 0, max: 300, step: 1 },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCallbacks: Story = {
  args: {
    onPlay: () => console.log('Audio started playing'),
    onPause: () => console.log('Audio paused'),
    onComplete: () => console.log('Audio completed'),
  },
};

export const StartFromMiddle: Story = {
  args: {
    initialPosition: 30,
  },
};

export const LongAudio: Story = {
  args: {
    // Longer audio file for testing scrubbing and time display
    audioUrl: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
  },
};

export const ShortAudio: Story = {
  args: {
    // Short audio file for testing quick playback
    audioUrl: 'https://www.soundjay.com/misc/sounds/beep-07a.wav',
  },
};

export const WithInitialPositionAndCallbacks: Story = {
  args: {
    audioUrl: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
    initialPosition: 15,
    onPlay: () => console.log('🎵 Audio started'),
    onPause: () => console.log('⏸️ Audio paused'),
    onComplete: () => console.log('✅ Audio finished'),
  },
};

export const InteractiveDemo: Story = {
  args: {
    audioUrl: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
    onPlay: () => {
      console.log('🎵 Playing audio...');
      // You could show a toast or trigger other UI updates here
    },
    onPause: () => {
      console.log('⏸️ Audio paused');
    },
    onComplete: () => {
      console.log('✅ Audio completed! You could show a completion message here.');
    },
  },
};

// Mock story to demonstrate error handling
export const InvalidAudioUrl: Story = {
  args: {
    audioUrl: 'https://invalid-url.com/nonexistent-audio.mp3',
  },
};
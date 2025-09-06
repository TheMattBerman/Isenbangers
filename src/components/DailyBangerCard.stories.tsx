import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import DailyBangerCard from './DailyBangerCard';

const meta: Meta<typeof DailyBangerCard> = {
  title: 'Components/DailyBangerCard',
  component: DailyBangerCard,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 16, backgroundColor: '#f3f4f6' }}>
        <Story />
      </View>
    ),
  ],
  args: {
    quoteId: 'sample-quote-1',
    category: 'startup',
    date: '2024-03-15T10:00:00Z',
    quoteText: 'This is a sample quote that demonstrates the component.',
    authorName: 'Greg Isenberg',
    audioUrl: 'https://example.com/audio.mp3',
    isLocked: false,
  },
  argTypes: {
    category: {
      control: 'select',
      options: ['fundraising', 'grit', 'growth', 'mindset', 'startup', 'general'],
    },
    isLocked: {
      control: 'boolean',
    },
    audioUrl: {
      control: 'text',
    },
    authorAvatarUrl: {
      control: 'text',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Locked: Story = {
  args: {
    isLocked: true,
  },
};

export const LongQuote: Story = {
  args: {
    quoteText: 'This is a very long quote that will definitely exceed the three line limit and should trigger the expand functionality. It contains multiple sentences and really tests how the component handles lengthy content. The expand button should appear at the bottom, allowing users to see the full text when they tap it. This ensures the card maintains a clean appearance while still providing access to complete content.',
  },
};

export const NoAudio: Story = {
  args: {
    audioUrl: undefined,
  },
};

export const WithAvatar: Story = {
  args: {
    authorAvatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  },
};

export const FundraisingCategory: Story = {
  args: {
    category: 'fundraising',
    quoteText: 'Raising capital is about selling a vision of the future that investors want to be part of.',
  },
};

export const GritCategory: Story = {
  args: {
    category: 'grit',
    quoteText: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
  },
};

export const GrowthCategory: Story = {
  args: {
    category: 'growth',
    quoteText: 'Growth and comfort do not coexist. You have to choose which one matters more.',
  },
};

export const MindsetCategory: Story = {
  args: {
    category: 'mindset',
    quoteText: 'Your mindset is your most powerful tool. Use it wisely.',
  },
};

export const LockedLongQuote: Story = {
  args: {
    isLocked: true,
    quoteText: 'This is a locked card with a very long quote that would normally show an expand button. However, since the card is locked, users cannot interact with any of the content until they unlock it. The overlay prevents all interactions.',
  },
};

export const WithAudioPlayer: Story = {
  args: {
    audioUrl: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
    quoteText: 'This quote has audio! Tap the play button to listen. You can scrub through the waveform, adjust playback speed, and see elapsed time.',
    authorName: 'Greg Isenberg',
    category: 'startup',
  },
};

export const AudioPlayerInteractive: Story = {
  args: {
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    quoteText: 'Interactive audio demo: Try the waveform scrubbing, speed controls (long press play button), and see how the progress updates in real-time.',
    authorName: 'Greg Isenberg',
    category: 'growth',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  },
};

export const LongQuoteWithAudio: Story = {
  args: {
    audioUrl: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
    quoteText: 'This is a very long quote with audio capabilities that demonstrates both the expand/collapse functionality and the full-featured audio player. The quote is long enough to trigger the expand button, and when expanded, you can see the complete text along with the audio player below. The audio player includes waveform scrubbing, speed controls, and time displays.',
    authorName: 'Greg Isenberg',
    category: 'mindset',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  },
};
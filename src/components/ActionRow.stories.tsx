import type { Meta, StoryObj } from '@storybook/react-native';
import { View, Alert } from 'react-native';
import { useState } from 'react';
import ActionRow from './ActionRow';

const meta: Meta<typeof ActionRow> = {
  title: 'Components/ActionRow',
  component: ActionRow,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 16, backgroundColor: '#f3f4f6', justifyContent: 'center' }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Interactive story with state management
const InteractiveActionRow = ({ isSaved: initialSaved = false }) => {
  const [isSaved, setIsSaved] = useState(initialSaved);

  return (
    <ActionRow
      onShare={() => Alert.alert('Share', 'Share button pressed')}
      onSave={() => {
        setIsSaved(!isSaved);
        Alert.alert('Save', isSaved ? 'Removed from favorites' : 'Added to favorites');
      }}
      onCopy={() => Alert.alert('Copy', 'Quote copied to clipboard with attribution')}
      isSaved={isSaved}
    />
  );
};

export const Default: Story = {
  render: () => <InteractiveActionRow isSaved={false} />,
};

export const SavedState: Story = {
  render: () => <InteractiveActionRow isSaved={true} />,
};

export const UnsavedState: Story = {
  render: () => <InteractiveActionRow isSaved={false} />,
};

// Static stories for testing different states
export const StaticUnsaved: Story = {
  args: {
    onShare: () => console.log('Share pressed'),
    onSave: () => console.log('Save pressed'),
    onCopy: () => console.log('Copy pressed'),
    isSaved: false,
  },
};

export const StaticSaved: Story = {
  args: {
    onShare: () => console.log('Share pressed'),
    onSave: () => console.log('Save pressed'),
    onCopy: () => console.log('Copy pressed'),
    isSaved: true,
  },
};

// Story demonstrating narrow screen layout
export const NarrowScreen: Story = {
  decorators: [
    (Story) => (
      <View style={{ 
        width: 320, 
        padding: 16, 
        backgroundColor: '#f3f4f6', 
        alignSelf: 'center',
        justifyContent: 'center',
        flex: 1
      }}>
        <Story />
      </View>
    ),
  ],
  render: () => <InteractiveActionRow isSaved={false} />,
};

// Story demonstrating wide screen layout
export const WideScreen: Story = {
  decorators: [
    (Story) => (
      <View style={{ 
        width: 500, 
        padding: 16, 
        backgroundColor: '#f3f4f6', 
        alignSelf: 'center',
        justifyContent: 'center',
        flex: 1
      }}>
        <Story />
      </View>
    ),
  ],
  render: () => <InteractiveActionRow isSaved={false} />,
};

// Story for testing animation states
export const AnimationDemo: Story = {
  render: () => {
    const [isSaved, setIsSaved] = useState(false);
    
    return (
      <ActionRow
        onShare={() => console.log('Share animation demo')}
        onSave={() => {
          setIsSaved(!isSaved);
          // The heart burst animation will trigger automatically
        }}
        onCopy={() => console.log('Copy animation demo')}
        isSaved={isSaved}
      />
    );
  },
};
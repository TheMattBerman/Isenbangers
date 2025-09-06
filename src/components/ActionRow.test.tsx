import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

// Mock dependencies
jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(() => Promise.resolve()),
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

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Dimensions: {
      get: jest.fn(() => ({ width: 400, height: 800 })), // Default wide screen
    },
  };
});

// Import component after mocks
import ActionRow from './ActionRow';

describe('ActionRow', () => {
  const defaultProps = {
    onShare: jest.fn(),
    onSave: jest.fn(),
    onCopy: jest.fn(),
    isSaved: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders all action buttons', () => {
      render(<ActionRow {...defaultProps} />);
      
      expect(screen.getByLabelText('Share quote')).toBeTruthy();
      expect(screen.getByLabelText('Add to favorites')).toBeTruthy();
      expect(screen.getByLabelText('Copy quote')).toBeTruthy();
    });

    it('shows correct heart icon for unsaved state', () => {
      render(<ActionRow {...defaultProps} isSaved={false} />);
      
      expect(screen.getByLabelText('Add to favorites')).toBeTruthy();
    });

    it('shows correct heart icon for saved state', () => {
      render(<ActionRow {...defaultProps} isSaved={true} />);
      
      expect(screen.getByLabelText('Remove from favorites')).toBeTruthy();
    });

    it('renders Share button with correct text', () => {
      render(<ActionRow {...defaultProps} />);
      
      expect(screen.getByText('Share')).toBeTruthy();
    });
  });

  describe('Share Functionality', () => {
    it('calls onShare when Share button is pressed', () => {
      render(<ActionRow {...defaultProps} />);
      
      const shareButton = screen.getByLabelText('Share quote');
      fireEvent.press(shareButton);
      
      expect(defaultProps.onShare).toHaveBeenCalledTimes(1);
    });

    it('triggers haptic feedback when Share is pressed', () => {
      render(<ActionRow {...defaultProps} />);
      
      const shareButton = screen.getByLabelText('Share quote');
      fireEvent.press(shareButton);
      
      expect(Haptics.selectionAsync).toHaveBeenCalled();
    });
  });

  describe('Save Functionality', () => {
    it('calls onSave when Save button is pressed', () => {
      render(<ActionRow {...defaultProps} />);
      
      const saveButton = screen.getByLabelText('Add to favorites');
      fireEvent.press(saveButton);
      
      expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
    });

    it('triggers haptic feedback when Save is pressed', () => {
      render(<ActionRow {...defaultProps} />);
      
      const saveButton = screen.getByLabelText('Add to favorites');
      fireEvent.press(saveButton);
      
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });

    it('changes accessibility label based on saved state', () => {
      const { rerender } = render(<ActionRow {...defaultProps} isSaved={false} />);
      
      expect(screen.getByLabelText('Add to favorites')).toBeTruthy();
      
      rerender(<ActionRow {...defaultProps} isSaved={true} />);
      
      expect(screen.getByLabelText('Remove from favorites')).toBeTruthy();
    });
  });

  describe('Copy Functionality', () => {
    it('calls onCopy when Copy button is pressed', async () => {
      render(<ActionRow {...defaultProps} />);
      
      const copyButton = screen.getByLabelText('Copy quote');
      fireEvent.press(copyButton);
      
      await waitFor(() => {
        expect(defaultProps.onCopy).toHaveBeenCalledTimes(1);
      });
    });

    it('copies text to clipboard when Copy is pressed', async () => {
      render(<ActionRow {...defaultProps} />);
      
      const copyButton = screen.getByLabelText('Copy quote');
      fireEvent.press(copyButton);
      
      await waitFor(() => {
        expect(Clipboard.setStringAsync).toHaveBeenCalledWith('Copied with attribution');
      });
    });

    it('shows success toast when copy succeeds', async () => {
      render(<ActionRow {...defaultProps} />);
      
      const copyButton = screen.getByLabelText('Copy quote');
      fireEvent.press(copyButton);
      
      await waitFor(() => {
        expect(screen.getByText('Copied with attribution')).toBeTruthy();
      });
    });

    it('shows error toast when copy fails', async () => {
      (Clipboard.setStringAsync as jest.Mock).mockRejectedValueOnce(new Error('Copy failed'));
      
      render(<ActionRow {...defaultProps} />);
      
      const copyButton = screen.getByLabelText('Copy quote');
      fireEvent.press(copyButton);
      
      await waitFor(() => {
        expect(screen.getByText('Copy failed')).toBeTruthy();
      });
    });

    it('triggers haptic feedback when copy succeeds', async () => {
      render(<ActionRow {...defaultProps} />);
      
      const copyButton = screen.getByLabelText('Copy quote');
      fireEvent.press(copyButton);
      
      await waitFor(() => {
        expect(Haptics.selectionAsync).toHaveBeenCalled();
      });
    });
  });

  describe('Toast Functionality', () => {
    it('hides toast after timeout', async () => {
      jest.useFakeTimers();
      
      render(<ActionRow {...defaultProps} />);
      
      const copyButton = screen.getByLabelText('Copy quote');
      fireEvent.press(copyButton);
      
      await waitFor(() => {
        expect(screen.getByText('Copied with attribution')).toBeTruthy();
      });
      
      // Fast forward past toast duration
      jest.advanceTimersByTime(2000);
      
      await waitFor(() => {
        expect(screen.queryByText('Copied with attribution')).toBeFalsy();
      });
      
      jest.useRealTimers();
    });
  });

  describe('Responsive Layout', () => {
    it('adapts layout for narrow screens', () => {
      // Mock narrow screen width
      const RN = require('react-native');
      RN.Dimensions.get.mockReturnValueOnce({ width: 320, height: 800 });
      
      render(<ActionRow {...defaultProps} />);
      
      // Component should still render all buttons
      expect(screen.getByLabelText('Share quote')).toBeTruthy();
      expect(screen.getByLabelText('Add to favorites')).toBeTruthy();
      expect(screen.getByLabelText('Copy quote')).toBeTruthy();
    });

    it('adapts layout for wide screens', () => {
      // Mock wide screen width
      const RN = require('react-native');
      RN.Dimensions.get.mockReturnValueOnce({ width: 500, height: 800 });
      
      render(<ActionRow {...defaultProps} />);
      
      // Component should still render all buttons
      expect(screen.getByLabelText('Share quote')).toBeTruthy();
      expect(screen.getByLabelText('Add to favorites')).toBeTruthy();
      expect(screen.getByLabelText('Copy quote')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels for all buttons', () => {
      render(<ActionRow {...defaultProps} isSaved={false} />);
      
      expect(screen.getByLabelText('Share quote')).toBeTruthy();
      expect(screen.getByLabelText('Add to favorites')).toBeTruthy();
      expect(screen.getByLabelText('Copy quote')).toBeTruthy();
    });

    it('updates accessibility label when save state changes', () => {
      const { rerender } = render(<ActionRow {...defaultProps} isSaved={false} />);
      
      expect(screen.getByLabelText('Add to favorites')).toBeTruthy();
      expect(screen.queryByLabelText('Remove from favorites')).toBeFalsy();
      
      rerender(<ActionRow {...defaultProps} isSaved={true} />);
      
      expect(screen.getByLabelText('Remove from favorites')).toBeTruthy();
      expect(screen.queryByLabelText('Add to favorites')).toBeFalsy();
    });
  });

  describe('Button Interactions', () => {
    it('handles press in/out animations for Share button', () => {
      render(<ActionRow {...defaultProps} />);
      
      const shareButton = screen.getByLabelText('Share quote');
      
      fireEvent(shareButton, 'pressIn');
      fireEvent(shareButton, 'pressOut');
      
      // If animations work without errors, test passes
      expect(shareButton).toBeTruthy();
    });

    it('handles press in/out animations for Save button', () => {
      render(<ActionRow {...defaultProps} />);
      
      const saveButton = screen.getByLabelText('Add to favorites');
      
      fireEvent(saveButton, 'pressIn');
      fireEvent(saveButton, 'pressOut');
      
      // If animations work without errors, test passes
      expect(saveButton).toBeTruthy();
    });

    it('handles press in/out animations for Copy button', () => {
      render(<ActionRow {...defaultProps} />);
      
      const copyButton = screen.getByLabelText('Copy quote');
      
      fireEvent(copyButton, 'pressIn');
      fireEvent(copyButton, 'pressOut');
      
      // If animations work without errors, test passes
      expect(copyButton).toBeTruthy();
    });
  });
});
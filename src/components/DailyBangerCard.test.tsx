import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

// Mock all dependencies before importing the component
jest.mock('date-fns', () => ({
  format: jest.fn(() => 'Mar 15, 2024'),
}));

jest.mock('./AudioMiniPlayer', () => {
  const mockReact = require('react');
  const { View, Text } = require('react-native');
  
  return function MockAudioMiniPlayer() {
    return mockReact.createElement(View, { testID: 'audio-mini-player' }, 
      mockReact.createElement(Text, null, 'Audio Player')
    );
  };
});

jest.mock('../utils/cn', () => ({
  cn: jest.fn((...args) => args.filter(Boolean).join(' ')),
}));

// Import component after mocks
import DailyBangerCard from './DailyBangerCard';

describe('DailyBangerCard', () => {
  const defaultProps = {
    quoteId: 'test-quote-1',
    category: 'startup',
    date: '2024-03-15T10:00:00Z',
    quoteText: 'This is a test quote.',
    authorName: 'Test Author',
    isLocked: false,
  };

  describe('Basic Rendering', () => {
    it('renders category pill correctly', () => {
      render(<DailyBangerCard {...defaultProps} />);
      expect(screen.getByText('startup')).toBeTruthy();
    });

    it('renders date correctly', () => {
      render(<DailyBangerCard {...defaultProps} />);
      expect(screen.getByText('Mar 15, 2024')).toBeTruthy();
    });

    it('renders quote text', () => {
      render(<DailyBangerCard {...defaultProps} />);
      expect(screen.getByTestId('quoteText')).toBeTruthy();
      expect(screen.getByText('"This is a test quote."')).toBeTruthy();
    });

    it('renders author row', () => {
      render(<DailyBangerCard {...defaultProps} />);
      expect(screen.getByTestId('authorRow')).toBeTruthy();
      expect(screen.getByText('Test Author')).toBeTruthy();
    });
  });

  describe('Category Colors', () => {
    it.each([
      ['fundraising', 'bg-purple-50 text-purple-700'],
      ['grit', 'bg-pink-50 text-pink-700'], 
      ['growth', 'bg-blue-50 text-blue-700'],
      ['mindset', 'bg-fuchsia-50 text-fuchsia-700'],
      ['startup', 'bg-orange-50 text-orange-700'],
      ['general', 'bg-gray-100 text-gray-800'],
    ])('applies correct color for %s category', (category) => {
      render(<DailyBangerCard {...defaultProps} category={category} />);
      expect(screen.getByText(category)).toBeTruthy();
    });
  });

  describe('Expand/Collapse Functionality', () => {
    const longQuote = 'This is a very long quote that definitely exceeds the typical three line limit and should trigger the expand functionality. It contains multiple sentences and tests the expand behavior of the component.';

    it('shows Expand button for long quotes', () => {
      render(<DailyBangerCard {...defaultProps} quoteText={longQuote} />);
      expect(screen.getByText('Expand')).toBeTruthy();
    });

    it('does not show Expand button for short quotes', () => {
      render(<DailyBangerCard {...defaultProps} quoteText="Short quote" />);
      expect(screen.queryByText('Expand')).toBeNull();
    });

    it('toggles between Expand and Collapse', () => {
      render(<DailyBangerCard {...defaultProps} quoteText={longQuote} />);
      
      const expandButton = screen.getByText('Expand');
      fireEvent.press(expandButton);
      
      expect(screen.getByText('Collapse')).toBeTruthy();
      expect(screen.queryByText('Expand')).toBeNull();
      
      const collapseButton = screen.getByText('Collapse');
      fireEvent.press(collapseButton);
      
      expect(screen.getByText('Expand')).toBeTruthy();
      expect(screen.queryByText('Collapse')).toBeNull();
    });
  });

  describe('Audio Functionality', () => {
    it('shows audio player when audioUrl is provided', () => {
      render(<DailyBangerCard {...defaultProps} audioUrl="https://example.com/audio.mp3" />);
      expect(screen.getByTestId('playArea')).toBeTruthy();
      expect(screen.getByTestId('audio-mini-player')).toBeTruthy();
    });

    it('does not show audio player when audioUrl is not provided', () => {
      render(<DailyBangerCard {...defaultProps} />);
      expect(screen.queryByTestId('playArea')).toBeNull();
      expect(screen.queryByTestId('audio-mini-player')).toBeNull();
    });
  });

  describe('Author Avatar', () => {
    it('shows author avatar when authorAvatarUrl is provided', () => {
      render(<DailyBangerCard {...defaultProps} authorAvatarUrl="https://example.com/avatar.jpg" />);
      // The avatar image should be present in the author row
      const authorRow = screen.getByTestId('authorRow');
      expect(authorRow).toBeTruthy();
    });

    it('shows author initial when no avatar is provided', () => {
      render(<DailyBangerCard {...defaultProps} />);
      expect(screen.getByText('T')).toBeTruthy(); // First letter of "Test Author"
    });
  });

  describe('Locked State', () => {
    it('shows lock overlay when isLocked is true', () => {
      render(<DailyBangerCard {...defaultProps} isLocked={true} />);
      expect(screen.getByText('🔒 Unlock to view')).toBeTruthy();
    });

    it('does not show lock overlay when isLocked is false', () => {
      render(<DailyBangerCard {...defaultProps} isLocked={false} />);
      expect(screen.queryByText('🔒 Unlock to view')).toBeNull();
    });

    it('prevents category press when locked', () => {
      const mockOnCategoryPress = jest.fn();
      render(
        <DailyBangerCard 
          {...defaultProps} 
          isLocked={true} 
          onCategoryPress={mockOnCategoryPress}
        />
      );
      
      const categoryButton = screen.getByText('startup');
      fireEvent.press(categoryButton);
      
      expect(mockOnCategoryPress).not.toHaveBeenCalled();
    });
  });

  describe('Category Press Handler', () => {
    it('calls onCategoryPress when category is pressed and not locked', () => {
      const mockOnCategoryPress = jest.fn();
      render(
        <DailyBangerCard 
          {...defaultProps} 
          onCategoryPress={mockOnCategoryPress}
        />
      );
      
      const categoryButton = screen.getByText('startup');
      fireEvent.press(categoryButton);
      
      expect(mockOnCategoryPress).toHaveBeenCalledWith('startup');
    });
  });

  describe('Accessibility', () => {
    it('has correct accessibility label', () => {
      render(<DailyBangerCard {...defaultProps} />);
      expect(screen.getByLabelText('Daily Banger: startup, quote by Test Author')).toBeTruthy();
    });

    it('has correct testIDs for key elements', () => {
      render(<DailyBangerCard {...defaultProps} audioUrl="https://example.com/audio.mp3" />);
      expect(screen.getByTestId('quoteText')).toBeTruthy();
      expect(screen.getByTestId('authorRow')).toBeTruthy();
      expect(screen.getByTestId('playArea')).toBeTruthy();
    });

    it('has accessible category button', () => {
      const mockOnCategoryPress = jest.fn();
      render(
        <DailyBangerCard 
          {...defaultProps} 
          onCategoryPress={mockOnCategoryPress}
        />
      );
      
      expect(screen.getByLabelText('Filter by startup category')).toBeTruthy();
    });

    it('has accessible expand/collapse buttons', () => {
      const longQuote = 'This is a very long quote that definitely exceeds the typical three line limit and should trigger the expand functionality.';
      render(<DailyBangerCard {...defaultProps} quoteText={longQuote} />);
      
      expect(screen.getByLabelText('Expand quote')).toBeTruthy();
      
      fireEvent.press(screen.getByText('Expand'));
      
      expect(screen.getByLabelText('Collapse quote')).toBeTruthy();
    });
  });
});
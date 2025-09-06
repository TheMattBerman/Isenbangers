import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, LayoutChangeEvent, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  runOnJS,
  useReducedMotion 
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import {
  WaveformData,
  generateMockWaveform,
  calculateTimeFromPosition,
  calculatePositionFromTime,
  formatTime,
  calculateProgress,
  getWaveformData
} from '../utils/waveformUtils';

interface AudioPlayerProps {
  audioUrl: string;
  initialPosition?: number;
  onPlay?: () => void;
  onPause?: () => void;
  onComplete?: () => void;
}

type PlaybackSpeed = 1.0 | 1.25 | 1.5;

export default function AudioPlayer({
  audioUrl,
  initialPosition = 0,
  onPlay,
  onPause,
  onComplete,
}: AudioPlayerProps) {
  // Audio state
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(initialPosition);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1.0);
  
  // UI state
  const [containerWidth, setContainerWidth] = useState(0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [waveformData, setWaveformData] = useState<WaveformData | null>(null);
  const [waveformLoading, setWaveformLoading] = useState(true);
  
  // Animation values
  const playButtonScale = useSharedValue(1);
  const progressPosition = useSharedValue(0);
  const reduceMotion = useReducedMotion();
  
  // Refs
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const seekTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSeekTime = useRef<number>(0);
  
  // Initialize waveform data
  useEffect(() => {
    const loadWaveformData = async () => {
      try {
        setWaveformLoading(true);
        // Try to generate real waveform data from audio
        const waveform = await getWaveformData(audioUrl, 80);
        setWaveformData(waveform);
      } catch (error) {
        console.warn('Failed to load waveform data, using mock:', error);
        // Fallback to mock data
        const mockData = generateMockWaveform(120, 80);
        setWaveformData(mockData);
      } finally {
        setWaveformLoading(false);
      }
    };
    
    loadWaveformData();
  }, [audioUrl]);
  
  // Load audio
  useEffect(() => {
    loadAudio();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      if (seekTimeoutRef.current) {
        clearTimeout(seekTimeoutRef.current);
      }
    };
  }, [audioUrl]);
  
  // Update progress animation
  useEffect(() => {
    if (containerWidth > 0 && duration > 0) {
      const targetPosition = calculatePositionFromTime(position, duration, containerWidth);
      progressPosition.value = reduceMotion 
        ? targetPosition 
        : withTiming(targetPosition, { duration: 150 }); // Slightly longer for smoother animation
    }
  }, [position, duration, containerWidth, reduceMotion]);
  
  const loadAudio = async () => {
    try {
      setIsLoading(true);
      
      // Configure audio session
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
      });
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { 
          shouldPlay: false,
          positionMillis: initialPosition * 1000,
          rate: playbackSpeed,
        }
      );
      
      setSound(newSound);
      
      // Get duration
      const status = await newSound.getStatusAsync();
      if (status.isLoaded && status.durationMillis) {
        setDuration(status.durationMillis / 1000);
      }
      
      // Set up status update callback
      newSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      
    } catch (error) {
      console.error('Error loading audio:', error);
      Alert.alert('Error', 'Failed to load audio file');
    } finally {
      setIsLoading(false);
    }
  };
  
  const onPlaybackStatusUpdate = useCallback((status: any) => {
    if (status.isLoaded) {
      const newPosition = status.positionMillis / 1000;
      
      // Only update if there's a significant change to avoid excessive re-renders
      if (Math.abs(newPosition - position) > 0.1) {
        setPosition(newPosition);
      }
      
      setIsPlaying(status.isPlaying);
      
      if (status.didJustFinish && onComplete) {
        onComplete();
        setPosition(0); // Reset to beginning when finished
      }
    }
  }, [position, onComplete]);
  
  const togglePlayPause = useCallback(async () => {
    if (!sound) return;
    
    try {
      if (isPlaying) {
        await sound.pauseAsync();
        onPause?.();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        await sound.playAsync();
        onPlay?.();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  }, [sound, isPlaying, onPlay, onPause]);
  
  const seekToPosition = useCallback(async (newPosition: number) => {
    if (!sound || !duration) return;
    
    try {
      const positionMs = Math.max(0, Math.min(duration * 1000, newPosition * 1000));
      
      // Clear any existing seek timeout to prevent excessive seeking
      if (seekTimeoutRef.current) {
        clearTimeout(seekTimeoutRef.current);
      }
      
      const now = Date.now();
      lastSeekTime.current = now;
      
      // Debounce seeking to ensure sub-200ms response time
      seekTimeoutRef.current = setTimeout(async () => {
        // Only seek if this is the latest seek request
        if (lastSeekTime.current === now) {
          await sound.setPositionAsync(positionMs);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }, 50); // 50ms debounce for smooth scrubbing
      
      // Update position immediately for visual feedback
      setPosition(newPosition);
      
    } catch (error) {
      console.error('Error seeking:', error);
    }
  }, [sound, duration]);
  
  const changePlaybackSpeed = useCallback(async (speed: PlaybackSpeed) => {
    if (!sound) return;
    
    try {
      await sound.setRateAsync(speed, true);
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
      Haptics.selectionAsync();
    } catch (error) {
      console.error('Error changing playback speed:', error);
    }
  }, [sound]);
  
  // Gesture handling for waveform scrubbing with improved performance
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (!duration || containerWidth === 0) return;
      
      const newTime = calculateTimeFromPosition(event.x, containerWidth, duration);
      // Update visual position immediately for responsive feedback
      progressPosition.value = calculatePositionFromTime(newTime, duration, containerWidth);
      runOnJS(seekToPosition)(newTime);
    })
    .onEnd(() => {
      // Ensure final position is accurate when gesture ends
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    });
  
  const tapGesture = Gesture.Tap()
    .onEnd((event) => {
      if (!duration || containerWidth === 0) return;
      
      const newTime = calculateTimeFromPosition(event.x, containerWidth, duration);
      // Update visual position immediately for responsive tap feedback
      progressPosition.value = calculatePositionFromTime(newTime, duration, containerWidth);
      runOnJS(seekToPosition)(newTime);
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    });
  
  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .onEnd(() => {
      runOnJS(setShowSpeedMenu)(true);
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Heavy);
    });
  
  const composedGesture = Gesture.Simultaneous(
    Gesture.Race(panGesture, tapGesture),
    longPressGesture
  );
  
  const onLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };
  
  // Animated styles
  const playButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playButtonScale.value }],
  }));
  
  // Remove unused progressStyle since we now use individual bar coloring
  
  if (!waveformData || waveformLoading) {
    return (
      <View style={{ padding: 16, alignItems: 'center' }}>
        <Text style={{ color: '#6B7280' }}>{waveformLoading ? 'Processing audio...' : 'Loading...'}</Text>
      </View>
    );
  }
  
  return (
    <View style={{ padding: 16 }}>
      {/* Main Player Controls */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        {/* Play/Pause Button */}
        <GestureDetector gesture={longPressGesture}>
          <Pressable
            onPress={togglePlayPause}
            onPressIn={() => { playButtonScale.value = withTiming(0.95, { duration: 100 }); }}
            onPressOut={() => { playButtonScale.value = withTiming(1, { duration: 150 }); }}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? 'Pause audio' : 'Play audio'}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              marginRight: 16,
            }}
          >
            <Animated.View style={[playButtonAnimatedStyle, { flex: 1 }]}>
              <LinearGradient
                colors={['#FF8C33', '#FF7A1A']}
                style={{
                  flex: 1,
                  borderRadius: 28,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#FF7A1A',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <Ionicons
                  name={isLoading ? 'hourglass' : isPlaying ? 'pause' : 'play'}
                  size={24}
                  color="white"
                />
              </LinearGradient>
            </Animated.View>
          </Pressable>
        </GestureDetector>
        
        {/* Time Display */}
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text 
            style={{ fontSize: 14, color: '#6B7280', fontWeight: '600' }}
            testID="currentTime"
          >
            {formatTime(position)}
          </Text>
          <Text 
            style={{ fontSize: 14, color: '#6B7280', fontWeight: '600' }}
            testID="totalTime"
          >
            {formatTime(duration)}
          </Text>
        </View>
        
        {/* Speed Toggle */}
        <Pressable
          onPress={() => setShowSpeedMenu(!showSpeedMenu)}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
            backgroundColor: '#F3F4F6',
            marginLeft: 16,
          }}
          accessibilityRole="button"
          accessibilityLabel={`Playback speed ${playbackSpeed}x`}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#374151' }}>
            {playbackSpeed}x
          </Text>
        </Pressable>
      </View>
      
      {/* Waveform */}
      <GestureDetector gesture={composedGesture}>
        <View
          onLayout={onLayout}
          style={{
            height: 60,
            backgroundColor: '#F9FAFB',
            borderRadius: 12,
            padding: 8,
            position: 'relative',
          }}
          accessibilityRole="progressbar"
          accessibilityLabel="Audio waveform scrubber"
        >
          {/* Waveform Bars */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'flex-end', 
            height: '100%',
            justifyContent: 'space-between'
          }}>
            {waveformData.peaks.map((peak, index) => {
              const progress = calculateProgress(position, duration);
              const barProgress = index / waveformData.peaks.length;
              const isPlayed = barProgress <= progress;
              
              return (
                <View
                  key={index}
                  style={{
                    width: Math.max(2, containerWidth / waveformData.peaks.length - 1),
                    height: Math.max(4, peak * 44),
                    backgroundColor: isPlayed ? '#FF7A1A' : '#D1D5DB',
                    borderRadius: 1,
                    opacity: isPlayed ? 0.9 : 0.6,
                    // Smooth color transition handled by individual bar rendering
                  }}
                />
              );
            })}
          </View>
          
          {/* Progress Overlay - removed since individual bars now show progress */}
          
          {/* Progress Indicator */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 2,
                bottom: 2,
                width: 3,
                backgroundColor: '#FF4500',
                borderRadius: 2,
                shadowColor: '#FF4500',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 1,
                shadowRadius: 6,
                elevation: 5,
                zIndex: 10,
              },
              {
                transform: [{ translateX: progressPosition }],
              },
            ]}
          />
        </View>
      </GestureDetector>
      
      {/* Speed Menu */}
      {showSpeedMenu && (
        <View style={{
          position: 'absolute',
          top: 16,
          right: 16,
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
          zIndex: 1000,
        }}>
          {[1.0, 1.25, 1.5].map((speed) => (
            <Pressable
              key={speed}
              onPress={() => changePlaybackSpeed(speed as PlaybackSpeed)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: speed === playbackSpeed ? '#FEF3C7' : 'transparent',
                borderRadius: 8,
              }}
            >
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: speed === playbackSpeed ? '#92400E' : '#374151',
              }}>
                {speed}x
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
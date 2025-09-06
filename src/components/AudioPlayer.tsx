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
  calculateProgress
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
  
  // Animation values
  const playButtonScale = useSharedValue(1);
  const progressPosition = useSharedValue(0);
  const reduceMotion = useReducedMotion();
  
  // Refs
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize waveform data
  useEffect(() => {
    const mockData = generateMockWaveform(120, 80);
    setWaveformData(mockData);
  }, []);
  
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
    };
  }, [audioUrl]);
  
  // Update progress animation
  useEffect(() => {
    if (containerWidth > 0 && duration > 0) {
      const targetPosition = calculatePositionFromTime(position, duration, containerWidth);
      progressPosition.value = reduceMotion 
        ? targetPosition 
        : withTiming(targetPosition, { duration: 100 });
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
  
  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis / 1000);
      setIsPlaying(status.isPlaying);
      
      if (status.didJustFinish && onComplete) {
        onComplete();
      }
    }
  };
  
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
      await sound.setPositionAsync(positionMs);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
  
  // Gesture handling for waveform scrubbing
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (!duration || containerWidth === 0) return;
      
      const newTime = calculateTimeFromPosition(event.x, containerWidth, duration);
      runOnJS(seekToPosition)(newTime);
    });
  
  const tapGesture = Gesture.Tap()
    .onEnd((event) => {
      if (!duration || containerWidth === 0) return;
      
      const newTime = calculateTimeFromPosition(event.x, containerWidth, duration);
      runOnJS(seekToPosition)(newTime);
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
  
  const progressStyle = useAnimatedStyle(() => ({
    width: progressPosition.value,
  }));
  
  if (!waveformData) {
    return (
      <View style={{ padding: 16, alignItems: 'center' }}>
        <Text style={{ color: '#6B7280' }}>Loading...</Text>
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
            {waveformData.peaks.map((peak, index) => (
              <View
                key={index}
                style={{
                  width: Math.max(2, containerWidth / waveformData.peaks.length - 1),
                  height: Math.max(4, peak * 44),
                  backgroundColor: '#D1D5DB',
                  borderRadius: 1,
                }}
              />
            ))}
          </View>
          
          {/* Progress Overlay */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                left: 8,
                top: 8,
                bottom: 8,
                backgroundColor: '#FF7A1A',
                borderRadius: 12,
                opacity: 0.8,
              },
              progressStyle,
            ]}
          />
          
          {/* Progress Indicator */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 4,
                bottom: 4,
                width: 2,
                backgroundColor: '#FF7A1A',
                borderRadius: 1,
                shadowColor: '#FF7A1A',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 4,
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
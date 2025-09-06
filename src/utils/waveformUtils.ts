/**
 * Utility functions for waveform generation and manipulation
 */

export interface WaveformPeak {
  value: number; // 0 to 1 representing amplitude
  time: number;  // Time in seconds
}

export interface WaveformData {
  peaks: number[]; // Array of amplitude values (0-1)
  duration: number; // Total duration in seconds
  sampleRate: number; // Samples per second
}

/**
 * Generates mock waveform data for testing and fallback scenarios
 */
export function generateMockWaveform(
  duration: number = 120, 
  peakCount: number = 100
): WaveformData {
  const peaks: number[] = [];
  
  for (let i = 0; i < peakCount; i++) {
    // Create a somewhat realistic waveform with varying intensities
    const position = i / peakCount;
    
    // Add some variation - higher peaks in middle, lower at ends
    const baseIntensity = Math.sin(position * Math.PI) * 0.8;
    
    // Add random variation
    const randomVariation = (Math.random() - 0.5) * 0.4;
    
    // Add some rhythmic patterns
    const rhythmicPattern = Math.sin(position * Math.PI * 8) * 0.2;
    
    const finalValue = Math.max(0, Math.min(1, 
      baseIntensity + randomVariation + rhythmicPattern + 0.1
    ));
    
    peaks.push(finalValue);
  }
  
  return {
    peaks,
    duration,
    sampleRate: peakCount / duration
  };
}

/**
 * Normalizes waveform peaks to ensure they're within 0-1 range
 */
export function normalizeWaveformPeaks(peaks: number[]): number[] {
  const maxPeak = Math.max(...peaks);
  if (maxPeak === 0) return peaks;
  
  return peaks.map(peak => peak / maxPeak);
}

/**
 * Calculates the time position based on waveform interaction
 */
export function calculateTimeFromPosition(
  touchX: number,
  containerWidth: number,
  duration: number
): number {
  const position = Math.max(0, Math.min(1, touchX / containerWidth));
  return position * duration;
}

/**
 * Calculates the x position for a given time in the waveform
 */
export function calculatePositionFromTime(
  time: number,
  duration: number,
  containerWidth: number
): number {
  const position = Math.max(0, Math.min(1, time / duration));
  return position * containerWidth;
}

/**
 * Formats time in MM:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculates the progress percentage for a given time
 */
export function calculateProgress(currentTime: number, duration: number): number {
  if (duration === 0) return 0;
  return Math.max(0, Math.min(1, currentTime / duration));
}

/**
 * Generates peaks from raw audio data using Web Audio API
 * Falls back to server-provided peaks if available, otherwise generates client-side
 */
export async function processAudioData(
  audioUrl: string,
  targetPeakCount: number = 100
): Promise<WaveformData> {
  try {
    // Try to fetch audio data
    const response = await fetch(audioUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch audio data');
    }
    
    const arrayBuffer = await response.arrayBuffer();
    
    // Use Web Audio API to analyze the audio
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Get raw PCM data from the first channel
    const rawData = audioBuffer.getChannelData(0);
    const samples = rawData.length;
    const duration = audioBuffer.duration;
    
    // Calculate how many samples per peak
    const samplesPerPeak = Math.ceil(samples / targetPeakCount);
    const peaks: number[] = [];
    
    // Process data in chunks to create peaks
    for (let i = 0; i < targetPeakCount; i++) {
      const start = i * samplesPerPeak;
      const end = Math.min(start + samplesPerPeak, samples);
      
      // Find the maximum absolute value in this chunk
      let max = 0;
      for (let j = start; j < end; j++) {
        const abs = Math.abs(rawData[j]);
        if (abs > max) {
          max = abs;
        }
      }
      
      peaks.push(max);
    }
    
    // Normalize peaks
    const normalizedPeaks = normalizeWaveformPeaks(peaks);
    
    // Smooth the peaks for better visual appearance
    const smoothedPeaks = smoothWaveformPeaks(normalizedPeaks, 3);
    
    return {
      peaks: smoothedPeaks,
      duration,
      sampleRate: targetPeakCount / duration
    };
  } catch (error) {
    console.warn('Failed to process audio data, using mock waveform:', error);
    // Fallback to mock data if processing fails
    return generateMockWaveform(120, targetPeakCount);
  }
}

/**
 * Smooths waveform peaks using a simple moving average
 */
export function smoothWaveformPeaks(peaks: number[], windowSize: number = 3): number[] {
  if (windowSize <= 1) return peaks;
  
  const smoothed: number[] = [];
  const halfWindow = Math.floor(windowSize / 2);
  
  for (let i = 0; i < peaks.length; i++) {
    let sum = 0;
    let count = 0;
    
    for (let j = Math.max(0, i - halfWindow); j <= Math.min(peaks.length - 1, i + halfWindow); j++) {
      sum += peaks[j];
      count++;
    }
    
    smoothed.push(sum / count);
  }
  
  return smoothed;
}

/**
 * Cache for processed waveform data to avoid reprocessing
 */
const waveformCache = new Map<string, WaveformData>();

/**
 * Gets waveform data with caching support
 */
export async function getWaveformData(
  audioUrl: string,
  targetPeakCount: number = 100
): Promise<WaveformData> {
  const cacheKey = `${audioUrl}_${targetPeakCount}`;
  
  // Check cache first
  if (waveformCache.has(cacheKey)) {
    return waveformCache.get(cacheKey)!;
  }
  
  // Process audio data
  const waveformData = await processAudioData(audioUrl, targetPeakCount);
  
  // Cache the result
  waveformCache.set(cacheKey, waveformData);
  
  return waveformData;
}

/**
 * Clears the waveform cache
 */
export function clearWaveformCache(): void {
  waveformCache.clear();
}
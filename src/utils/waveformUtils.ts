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
 * Generates peaks from raw audio data (placeholder for future server-side integration)
 */
export function processAudioData(
  audioBuffer: ArrayBuffer,
  targetPeakCount: number = 100
): Promise<WaveformData> {
  // This is a placeholder for actual audio processing
  // In a real implementation, this would analyze the audio buffer
  // and generate peaks based on actual amplitude data
  
  return new Promise((resolve) => {
    // Simulate processing time
    setTimeout(() => {
      // For now, return mock data
      // TODO: Implement actual audio analysis using Web Audio API or native modules
      resolve(generateMockWaveform(120, targetPeakCount));
    }, 100);
  });
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
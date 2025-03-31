import { useState, useEffect, useRef } from "react";
import { useAudioDevices } from "./use-audio-devices";
import { AudioProcessor, DetectedSound } from "@/lib/audio-processor";

// Interface for measurement data - consecutive sound intervals
export interface Measurement {
  time: string;         // Time of the measurement display (HH:MM:SS format)
  intervalMs: number;   // Time between consecutive sounds in milliseconds
  frequency: number;    // Calculated beats per minute
  deviation: number;    // Deviation from the average interval (as a percentage)
}

export function useAudioAnalyzer() {
  // Audio devices state
  const { devices, selectedDeviceId, setSelectedDeviceId } = useAudioDevices();
  
  // Recording state
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState("00:00:00");
  
  // Sensitivity controls
  const [detectionThreshold, setDetectionThreshold] = useState(20);
  const [noiseReduction, setNoiseReduction] = useState(20);
  
  // Visualization data
  const [spectrogramData, setSpectrogramData] = useState<Uint8Array | null>(null);
  const [waveformData, setWaveformData] = useState<Uint8Array | null>(null);
  const [detectedSounds, setDetectedSounds] = useState<DetectedSound[]>([]);
  
  // Measurement data
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  
  // Refs
  const audioProcessorRef = useRef<AudioProcessor | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingStartTime = useRef<number>(0);
  const lastSoundTimeRef = useRef<number | null>(null);
  const intervalHistoryRef = useRef<number[]>([]);
  
  // Calculate measurement from detected sound - define this first to avoid circular dependency
  const calculateMeasurement = (sound: DetectedSound) => {
    const currentTime = sound.timestamp;
    
    // If we have a previous sound to compare against
    if (lastSoundTimeRef.current !== null) {
      // Calculate interval in milliseconds
      const intervalMs = (currentTime - lastSoundTimeRef.current) * 1000;
      
      // Only process reasonable intervals (filter out noise)
      if (intervalMs > 100) { // Minimum 100ms between clock sounds
        // Add to interval history, keeping most recent 10
        intervalHistoryRef.current = [...intervalHistoryRef.current, intervalMs].slice(-10);
        
        // Calculate average interval for deviation calculation
        const avgInterval = intervalHistoryRef.current.reduce((sum, val) => sum + val, 0) / 
                            intervalHistoryRef.current.length;
        
        // Calculate frequency in beats per minute
        const frequency = 60000 / intervalMs;
        
        // Calculate deviation as percentage from average
        const deviation = ((intervalMs - avgInterval) / avgInterval) * 100;
        
        // Format current recording time for display
        const elapsedSecs = Math.floor((Date.now() - recordingStartTime.current) / 1000);
        const hours = Math.floor(elapsedSecs / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((elapsedSecs % 3600) / 60).toString().padStart(2, '0');
        const seconds = (elapsedSecs % 60).toString().padStart(2, '0');
        const timeString = `${hours}:${minutes}:${seconds}`;
        
        // Create measurement and add to state
        const measurement: Measurement = {
          time: timeString,
          intervalMs: Math.round(intervalMs),
          frequency: Math.round(frequency * 10) / 10, // Round to 1 decimal place
          deviation: Math.round(deviation * 10) / 10, // Round to 1 decimal place
        };
        
        setMeasurements(prev => [...prev, measurement]);
      }
    }
    
    // Update last sound time for next calculation
    lastSoundTimeRef.current = currentTime;
  };
  
  // Define sound detection handler
  const handleSoundDetected = (sound: DetectedSound) => {
    // Update visualization data
    setDetectedSounds(prev => {
      const newDetectedSounds = [...prev, sound];
      return newDetectedSounds.length > 20 ? newDetectedSounds.slice(-20) : newDetectedSounds;
    });
    
    // Process measurement calculations
    calculateMeasurement(sound);
  };
  
  // Initialize audio processor
  useEffect(() => {
    // Create explicit handler functions to ensure data is properly set in state
    const handleSpectrogramData = (data: Uint8Array) => {
      // Check if data is valid
      if (!data || data.length === 0) {
        console.error("Received empty spectrogram data");
        return;
      }

      // Verify data has non-zero content
      const hasContent = data.some(v => v > 0);
      console.log(`Setting spectrogram data, length: ${data.length}, has content: ${hasContent}`);
      
      // Only update state if we have valid data
      if (hasContent) {
        // Create a new array to ensure state update
        const newData = new Uint8Array(data.length);
        newData.set(data);
        setSpectrogramData(newData);
      }
    };
    
    const handleWaveformData = (data: Uint8Array) => {
      // Check if data is valid
      if (!data || data.length === 0) {
        console.error("Received empty waveform data");
        return;
      }

      // Verify data has variation (not all 128)
      const hasVariation = data.some(v => v !== 128);
      console.log(`Setting waveform data, length: ${data.length}, has variation: ${hasVariation}`);
      
      // Only update state if we have valid data
      if (hasVariation) {
        // Create a new array to ensure state update
        const newData = new Uint8Array(data.length);
        newData.set(data);
        setWaveformData(newData);
      }
    };
    
    audioProcessorRef.current = new AudioProcessor({
      onSpectrogramData: handleSpectrogramData,
      onWaveformData: handleWaveformData,
      onSoundDetected: handleSoundDetected
    });
    
    return () => {
      stopRecording();
      audioProcessorRef.current?.dispose();
    };
  }, []);
  
  // Update threshold when changed
  useEffect(() => {
    if (audioProcessorRef.current) {
      audioProcessorRef.current.setDetectionThreshold(detectionThreshold / 100);
    }
  }, [detectionThreshold]);
  
  // Update noise reduction when changed
  useEffect(() => {
    if (audioProcessorRef.current) {
      audioProcessorRef.current.setNoiseReduction(noiseReduction / 100);
    }
  }, [noiseReduction]);
  
  // Start recording
  const startRecording = async () => {
    if (audioProcessorRef.current) {
      try {
        await audioProcessorRef.current.startRecording(selectedDeviceId);
        
        // Reset all recording state
        setRecording(true);
        setDetectedSounds([]);
        setMeasurements([]);
        
        // Reset refs
        lastSoundTimeRef.current = null;
        intervalHistoryRef.current = [];
        recordingStartTime.current = Date.now();
        
        // Start the timer
        resetTimer();
      } catch (error) {
        console.error("Error starting recording:", error);
      }
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (audioProcessorRef.current) {
      audioProcessorRef.current.stopRecording();
      setRecording(false);
      stopTimer();
    }
  };
  
  // Timer functions
  const resetTimer = () => {
    startTimeRef.current = Date.now();
    setRecordingTime("00:00:00");
    startTimer();
  };
  
  const startTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    timerIntervalRef.current = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const hours = Math.floor(elapsedSeconds / 3600).toString().padStart(2, '0');
      const minutes = Math.floor((elapsedSeconds % 3600) / 60).toString().padStart(2, '0');
      const seconds = (elapsedSeconds % 60).toString().padStart(2, '0');
      setRecordingTime(`${hours}:${minutes}:${seconds}`);
    }, 1000);
  };
  
  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };
  
  return {
    recording,
    recordingTime,
    audioDevices: devices,
    selectedDeviceId,
    detectionThreshold,
    noiseReduction,
    spectrogramData,
    waveformData,
    detectedSounds,
    measurements,
    startRecording,
    stopRecording,
    setSelectedDeviceId,
    setDetectionThreshold,
    setNoiseReduction
  };
}

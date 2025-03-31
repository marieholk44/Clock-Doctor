import { useState, useEffect, useRef } from "react";
import { useAudioDevices } from "./use-audio-devices";
import { AudioProcessor, DetectedSound } from "@/lib/audio-processor";

export interface Measurement {
  time: string;
  tickToTock: number;
  tockToTick: number;
  fullCycle: number;
}

export function useAudioAnalyzer() {
  // Audio devices state
  const { devices, selectedDeviceId, setSelectedDeviceId } = useAudioDevices();
  
  // Recording state
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState("00:00:00");
  
  // Sensitivity controls
  const [detectionThreshold, setDetectionThreshold] = useState(40);
  const [noiseReduction, setNoiseReduction] = useState(30);
  
  // Visualization data
  const [spectrogramData, setSpectrogramData] = useState<Uint8Array | null>(null);
  const [waveformData, setWaveformData] = useState<Uint8Array | null>(null);
  const [detectedSounds, setDetectedSounds] = useState<DetectedSound[]>([]);
  
  // Measurement data
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  
  // Refs
  const audioProcessorRef = useRef<AudioProcessor | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<number | null>(null);
  const recordingStartTime = useRef<number>(0);
  
  // Initialize audio processor
  useEffect(() => {
    audioProcessorRef.current = new AudioProcessor({
      onSpectrogramData: setSpectrogramData,
      onWaveformData: setWaveformData,
      onSoundDetected: (sound) => {
        setDetectedSounds(prev => {
          // Keep only the most recent sounds (for visualization)
          const updatedSounds = [...prev, sound];
          if (updatedSounds.length > 10) {
            return updatedSounds.slice(-10);
          }
          return updatedSounds;
        });
        
        processMeasurements(sound);
      }
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
  
  // Process sound detections into measurements
  const processMeasurements = (sound: DetectedSound) => {
    // Keep track of sounds for measurement
    setDetectedSounds(prev => {
      const newDetectedSounds = [...prev, sound];
      
      // Process measurements if we have enough sounds
      if (newDetectedSounds.length >= 3) {
        // Look for a sequence of tick-tock-tick
        let i = newDetectedSounds.length - 3;
        
        if (
          newDetectedSounds[i].type === 'tick' &&
          newDetectedSounds[i + 1].type === 'tock' &&
          newDetectedSounds[i + 2].type === 'tick'
        ) {
          const tickTime1 = newDetectedSounds[i].timestamp;
          const tockTime = newDetectedSounds[i + 1].timestamp;
          const tickTime2 = newDetectedSounds[i + 2].timestamp;
          
          const tickToTock = tockTime - tickTime1;
          const tockToTick = tickTime2 - tockTime;
          const fullCycle = tickTime2 - tickTime1;
          
          // Format the time for display
          const seconds = Math.floor((Date.now() - recordingStartTime.current) / 1000);
          const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
          const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
          const secs = (seconds % 60).toString().padStart(2, '0');
          const time = `${hours}:${minutes}:${secs}`;
          
          setMeasurements(prev => [
            ...prev,
            { time, tickToTock, tockToTick, fullCycle }
          ]);
        }
      }
      
      // Keep a reasonable number of detected sounds for visualization
      if (newDetectedSounds.length > 20) {
        return newDetectedSounds.slice(-20);
      }
      return newDetectedSounds;
    });
  };
  
  // Start recording
  const startRecording = async () => {
    if (audioProcessorRef.current) {
      try {
        await audioProcessorRef.current.startRecording(selectedDeviceId);
        
        setRecording(true);
        setDetectedSounds([]);
        resetTimer();
        
        recordingStartTime.current = Date.now();
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

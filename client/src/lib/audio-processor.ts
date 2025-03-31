export interface DetectedSound {
  type: "pulse"; // Using a single type for all clock sounds (no distinction needed)
  timestamp: number;
  magnitude: number;
}

interface AudioProcessorConfig {
  onSpectrogramData: (data: Uint8Array) => void;
  onWaveformData: (data: Uint8Array) => void;
  onSoundDetected: (sound: DetectedSound) => void;
}

export class AudioProcessor {
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private mediaStream: MediaStream | null = null;
  private spectrogramData: Uint8Array = new Uint8Array();
  private waveformData: Uint8Array = new Uint8Array();
  private detectionThreshold: number = 0.2;  // Lower default threshold (20%)
  private noiseReduction: number = 0.2;      // Lower noise reduction (20%)
  // We're using a single pulse type for all sounds now
  private lastPulseTime: number = 0;
  private config: AudioProcessorConfig;
  private animationFrameId: number | null = null;
  private minTimeBetweenSounds: number = 100; // Min time between sounds in ms (increased for clock timing)
  private lastSoundTime: number = 0;

  constructor(config: AudioProcessorConfig) {
    this.config = config;
  }

  public async startRecording(deviceId: string): Promise<void> {
    try {
      // Create audio context
      this.audioContext = new AudioContext();
      
      // Get media stream with selected device
      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          echoCancellation: false,     // Disable echo cancellation to preserve subtle clock sounds
          noiseSuppression: false,     // Disable noise suppression to catch all clock sounds
          autoGainControl: true,       // Enable auto gain to amplify quiet clock sounds
          sampleRate: 44100,           // Higher sample rate for better detection of transients
          channelCount: 1              // Mono is sufficient for clock analysis
        }
      };
      
      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Create nodes
      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyserNode = this.audioContext.createAnalyser();
      this.gainNode = this.audioContext.createGain();
      
      // Configure analyser - optimized for clock sound frequencies
      this.analyserNode.fftSize = 2048;  // Reduced from 4096 for better visualization performance
      this.analyserNode.smoothingTimeConstant = 0.5;  // Less smoothing for more responsive detection
      
      // Set initial gain higher for clock sounds
      this.gainNode.gain.value = 2.0;  // Amplify input to better detect quieter sounds
      
      // Create bandpass filter for clock sound frequencies (typically 100-2000 Hz)
      const filterNode = this.audioContext.createBiquadFilter();
      filterNode.type = 'bandpass';
      filterNode.frequency.value = 800;  // Center frequency for clock sounds
      filterNode.Q.value = 0.5;  // Wide bandwidth to capture variety of clock sounds
      
      // Connect nodes with filter
      this.sourceNode.connect(this.gainNode);
      this.gainNode.connect(filterNode);
      filterNode.connect(this.analyserNode);
      
      // Initialize data arrays with proper sizes
      const frequencyBinCount = this.analyserNode.frequencyBinCount;
      const timeDataLength = this.analyserNode.fftSize;
      
      console.log(`Creating frequency data array with ${frequencyBinCount} bins`);
      console.log(`Creating time domain data array with ${timeDataLength} samples`);
      
      this.spectrogramData = new Uint8Array(frequencyBinCount);
      this.waveformData = new Uint8Array(timeDataLength);
      
      // Create some initial data for testing - simulated sine wave
      for (let i = 0; i < this.waveformData.length; i++) {
        // Create a simple sine wave centered at 128 with amplitude 64
        this.waveformData[i] = 128 + Math.floor(64 * Math.sin(i * 0.1));
      }
      
      // Send initial data to visualizers to make sure they work
      this.config.onWaveformData(new Uint8Array(this.waveformData));
      
      // Add some simulated frequency data
      for (let i = 0; i < this.spectrogramData.length; i++) {
        // Create a frequency pattern with peaks in clock-relevant frequencies
        if (i > 20 && i < 100) {
          this.spectrogramData[i] = 50 + Math.floor(50 * Math.sin(i * 0.2));
        }
      }
      
      this.config.onSpectrogramData(new Uint8Array(this.spectrogramData));
      
      // Wait a moment to make sure initializing is complete
      setTimeout(() => {
        // Start the real analysis loop
        this.startAnalysisLoop();
      }, 500);
      
      // Reset state
      this.lastPulseTime = 0;
      this.lastSoundTime = 0;
      
    } catch (error) {
      console.error("Error starting audio recording:", error);
      throw error;
    }
  }

  public stopRecording(): void {
    // Stop the animation frame
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Disconnect and close all audio nodes
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    
    if (this.analyserNode) {
      this.analyserNode.disconnect();
      this.analyserNode = null;
    }
    
    // Stop all audio tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    // Close audio context
    if (this.audioContext) {
      if (this.audioContext.state !== 'closed') {
        this.audioContext.close();
      }
      this.audioContext = null;
    }
  }

  public setDetectionThreshold(value: number): void {
    this.detectionThreshold = Math.max(0, Math.min(1, value));
  }

  public setNoiseReduction(value: number): void {
    this.noiseReduction = Math.max(0, Math.min(1, value));
    
    // Apply noise reduction to gain node
    if (this.gainNode) {
      // Calculate gain based on noise reduction but maintain amplification
      // Keep a high base value (2.0) and reduce based on noise reduction setting
      this.gainNode.gain.value = 2.0 * (1 - this.noiseReduction * 0.5);
      
      // Log the gain adjustment for debugging
      console.log(`Noise reduction set to ${value}%, gain value: ${this.gainNode.gain.value.toFixed(2)}`);
    }
  }

  public dispose(): void {
    this.stopRecording();
  }

  // Store historical spectrograms to create a longer time view
  private spectrogramHistory: Uint8Array[] = [];
  private readonly historyLength = 15; // Store more frames to show a longer time window
  
  private startAnalysisLoop(): void {
    if (!this.analyserNode) return;
    
    // Clear history when starting
    this.spectrogramHistory = [];
    
    const analyzeAudio = () => {
      if (!this.analyserNode) return;
      
      // Get frequency data for spectrogram
      this.analyserNode.getByteFrequencyData(this.spectrogramData);
      
      // Create a copy of the data to avoid reference issues - using the proper way to copy Uint8Array
      const spectrogramDataCopy = new Uint8Array(this.spectrogramData.length);
      spectrogramDataCopy.set(this.spectrogramData);
      
      // Store in history for time-stretched display
      if (this.spectrogramHistory.length >= this.historyLength) {
        this.spectrogramHistory.shift(); // Remove oldest frame
      }
      this.spectrogramHistory.push(spectrogramDataCopy);
      
      // Create a combined spectrogram from history
      const combinedSpectrogram = this.createCombinedSpectrogram();
      
      // Debug info
      console.log(`Spectrogram data: length=${combinedSpectrogram.length}, non-zero=${combinedSpectrogram.some(v => v > 0)}`);
      
      // Send to visualizer
      this.config.onSpectrogramData(combinedSpectrogram);
      
      // Get time domain data for waveform
      this.analyserNode.getByteTimeDomainData(this.waveformData);
      
      // Create a copy of the data to avoid reference issues - using the proper way to copy Uint8Array
      const waveformDataCopy = new Uint8Array(this.waveformData.length);
      waveformDataCopy.set(this.waveformData);
      
      // Debug info (less frequent to reduce console spam)
      if (Math.random() < 0.1) { // Only log ~10% of frames
        console.log(`Waveform data: length=${waveformDataCopy.length}, non-zero=${waveformDataCopy.some(v => v !== 128)}`);
      }
      
      // Send to visualizer
      this.config.onWaveformData(waveformDataCopy);
      
      // Detect sounds
      this.detectSounds();
      
      // Continue the loop
      this.animationFrameId = requestAnimationFrame(analyzeAudio);
    };
    
    analyzeAudio();
  }
  
  // Create a combined spectrogram from history to show a longer time window
  private createCombinedSpectrogram(): Uint8Array {
    // If no history yet, return an empty array
    if (this.spectrogramHistory.length === 0) {
      return new Uint8Array(this.spectrogramData.length);
    }
    
    // For better visualization of time patterns, we'll create a downsampled view
    // that captures more time but with reduced frequency resolution
    const frequencyBins = Math.min(256, this.spectrogramData.length);
    const timeSteps = this.historyLength; 
    
    // Create output array
    const result = new Uint8Array(frequencyBins * timeSteps);
    
    // For each time step (column in the visualization)
    for (let t = 0; t < timeSteps; t++) {
      // Get the history frame for this time step, or an empty one if we don't have enough history yet
      const historyIndex = t - (timeSteps - this.spectrogramHistory.length);
      const historyFrame = historyIndex >= 0 ? this.spectrogramHistory[historyIndex] : null;
      
      if (historyFrame) {
        // Downsample the frequency data if needed
        const step = Math.ceil(historyFrame.length / frequencyBins);
        
        for (let f = 0; f < frequencyBins; f++) {
          // Average a range of frequency bins for smoother visualization
          let sum = 0;
          let count = 0;
          
          for (let i = 0; i < step; i++) {
            const srcIdx = f * step + i;
            if (srcIdx < historyFrame.length) {
              sum += historyFrame[srcIdx];
              count++;
            }
          }
          
          // Place in result array - layout is frequency bins stacked consecutively
          result[t * frequencyBins + f] = count > 0 ? Math.floor(sum / count) : 0;
        }
      }
    }
    
    return result;
  }

  private detectSounds(): void {
    if (!this.waveformData) return;
    
    // Calculate RMS (Root Mean Square) of the signal to get amplitude
    let sumOfSquares = 0;
    let peakValue = 0;
    
    for (let i = 0; i < this.waveformData.length; i++) {
      // Convert to [-1, 1] range
      const amplitude = (this.waveformData[i] - 128) / 128;
      sumOfSquares += amplitude * amplitude;
      
      // Track peak value for better transient detection
      const absAmplitude = Math.abs(amplitude);
      if (absAmplitude > peakValue) {
        peakValue = absAmplitude;
      }
    }
    
    const rms = Math.sqrt(sumOfSquares / this.waveformData.length);
    
    // Use a combination of RMS and peak detection for better results
    // Clock sounds have sharp transients (high peak values) but may have low RMS
    const effectiveAmplitude = (rms * 0.3) + (peakValue * 0.7);
    
    // Check if we detect a sound based on threshold
    const now = Date.now();
    const timeSinceLastSound = now - this.lastSoundTime;
    
    // Dynamically adjust minimum time between sounds based on previous intervals
    // This helps prevent false positives and missing pulses
    const dynamicMinTime = Math.max(100, this.minTimeBetweenSounds * 0.6);
    
    // Lower effective threshold for better sensitivity
    const effectiveThreshold = this.detectionThreshold * 0.7;
    
    // Only detect sound if:
    // 1. It's louder than our threshold
    // 2. Enough time has passed since the last sound (prevents double-triggering)
    if (effectiveAmplitude > effectiveThreshold && timeSinceLastSound > dynamicMinTime) {
      // Log sound detection for debugging
      console.log(`Sound detected! Amplitude: ${effectiveAmplitude.toFixed(3)}, Threshold: ${effectiveThreshold.toFixed(3)}, Time since last: ${timeSinceLastSound}ms`);
      
      // Update last sound time
      this.lastSoundTime = now;
      
      // Create the detected sound object with pulse type
      const detectedSound: DetectedSound = {
        type: "pulse",
        timestamp: now / 1000, // Convert to seconds for easier calculations
        magnitude: effectiveAmplitude
      };
      
      // Calculate time in milliseconds for better readability in debug logs
      const lastPulseInterval = (now - this.lastPulseTime) / 1000;
      if (this.lastPulseTime > 0) {
        console.log(`Interval between sounds: ${(lastPulseInterval * 1000).toFixed(0)}ms`);
      }
      this.lastPulseTime = now;
      
      // Notify via callback
      this.config.onSoundDetected(detectedSound);
    }
  }
}

export interface DetectedSound {
  type: "tick" | "tock";
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
  private lastSoundType: "tick" | "tock" | null = null;
  private lastTickTime: number = 0;
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
      this.analyserNode.fftSize = 4096;  // Larger FFT size for better frequency resolution
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
      
      // Initialize data arrays
      this.spectrogramData = new Uint8Array(this.analyserNode.frequencyBinCount);
      this.waveformData = new Uint8Array(this.analyserNode.fftSize);
      
      // Start analysis loop
      this.startAnalysisLoop();
      
      // Reset state
      this.lastSoundType = null;
      this.lastTickTime = 0;
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

  private startAnalysisLoop(): void {
    if (!this.analyserNode) return;
    
    const analyzeAudio = () => {
      if (!this.analyserNode) return;
      
      // Get frequency data for spectrogram
      this.analyserNode.getByteFrequencyData(this.spectrogramData);
      this.config.onSpectrogramData(this.spectrogramData);
      
      // Get time domain data for waveform
      this.analyserNode.getByteTimeDomainData(this.waveformData);
      this.config.onWaveformData(this.waveformData);
      
      // Detect sounds
      this.detectSounds();
      
      // Continue the loop
      this.animationFrameId = requestAnimationFrame(analyzeAudio);
    };
    
    analyzeAudio();
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
    
    // Lower effective threshold for better sensitivity
    const effectiveThreshold = this.detectionThreshold * 0.7;
    
    if (effectiveAmplitude > effectiveThreshold && timeSinceLastSound > this.minTimeBetweenSounds) {
      // Log sound detection for debugging
      console.log(`Sound detected! Amplitude: ${effectiveAmplitude.toFixed(3)}, Threshold: ${effectiveThreshold.toFixed(3)}`);
      
      // Spectral analysis to determine if it's tick or tock
      // Typically tick sounds have more high frequency content than tock sounds
      let highFrequencyEnergy = 0;
      let lowFrequencyEnergy = 0;
      
      // Simple spectral analysis using FFT data
      if (this.spectrogramData) {
        const midpoint = Math.floor(this.spectrogramData.length / 2);
        
        for (let i = 0; i < midpoint; i++) {
          lowFrequencyEnergy += this.spectrogramData[i];
        }
        
        for (let i = midpoint; i < this.spectrogramData.length; i++) {
          highFrequencyEnergy += this.spectrogramData[i];
        }
      }
      
      // Determine sound type more intelligently
      let soundType: "tick" | "tock";
      
      if (this.lastSoundType === null) {
        // First sound is always a tick by convention
        soundType = "tick";
      } else if (this.lastSoundType === "tick") {
        // After a tick comes a tock
        soundType = "tock";
      } else {
        // After a tock comes a tick
        soundType = "tick";
      }
      
      // Update last sound info
      this.lastSoundType = soundType;
      this.lastSoundTime = now;
      if (soundType === "tick") {
        this.lastTickTime = now;
      }
      
      // Create the detected sound object
      const detectedSound: DetectedSound = {
        type: soundType,
        timestamp: now / 1000, // Convert to seconds for easier calculations
        magnitude: effectiveAmplitude
      };
      
      // Notify via callback
      this.config.onSoundDetected(detectedSound);
    }
  }
}

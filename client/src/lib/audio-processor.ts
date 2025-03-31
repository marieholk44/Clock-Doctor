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
  private detectionThreshold: number = 0.4;  // Default threshold (40%)
  private noiseReduction: number = 0.3;      // Default noise reduction (30%)
  private lastSoundType: "tick" | "tock" | null = null;
  private lastTickTime: number = 0;
  private config: AudioProcessorConfig;
  private animationFrameId: number | null = null;
  private minTimeBetweenSounds: number = 50; // Min time between sounds in ms
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
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false
        }
      };
      
      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Create nodes
      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyserNode = this.audioContext.createAnalyser();
      this.gainNode = this.audioContext.createGain();
      
      // Configure analyser
      this.analyserNode.fftSize = 2048;
      this.analyserNode.smoothingTimeConstant = 0.8;
      
      // Connect nodes
      this.sourceNode.connect(this.gainNode);
      this.gainNode.connect(this.analyserNode);
      
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
      // Invert the value for gain (1 - noise reduction)
      this.gainNode.gain.value = 1 - this.noiseReduction * 0.5;
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
    for (let i = 0; i < this.waveformData.length; i++) {
      // Convert to [-1, 1] range
      const amplitude = (this.waveformData[i] - 128) / 128;
      sumOfSquares += amplitude * amplitude;
    }
    
    const rms = Math.sqrt(sumOfSquares / this.waveformData.length);
    
    // Check if we detect a sound based on threshold
    const now = Date.now();
    const timeSinceLastSound = now - this.lastSoundTime;
    
    if (rms > this.detectionThreshold && timeSinceLastSound > this.minTimeBetweenSounds) {
      // Determine if this is a tick or tock
      let soundType: "tick" | "tock";
      
      if (this.lastSoundType === null || this.lastSoundType === "tock") {
        soundType = "tick";
        this.lastTickTime = now;
      } else {
        soundType = "tock";
      }
      
      // Update last sound info
      this.lastSoundType = soundType;
      this.lastSoundTime = now;
      
      // Create the detected sound object
      const detectedSound: DetectedSound = {
        type: soundType,
        timestamp: now / 1000, // Convert to seconds for easier calculations
        magnitude: rms
      };
      
      // Notify via callback
      this.config.onSoundDetected(detectedSound);
    }
  }
}

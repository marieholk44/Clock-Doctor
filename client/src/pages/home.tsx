import ControlsPanel from "@/components/controls-panel";
import SpectrogramVisualizer from "@/components/spectrogram-visualizer";
import WaveformVisualizer from "@/components/waveform-visualizer";
import TimingAnalysis from "@/components/timing-analysis";
import { useAudioAnalyzer } from "@/hooks/use-audio-analyzer";

export default function Home() {
  const {
    recording,
    recordingTime,
    audioDevices,
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
  } = useAudioAnalyzer();

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-blue-400 flex items-center">
            <span className="material-icons mr-2">timer</span>
            Clock Repair Analyzer
          </h1>
          <p className="text-slate-400 mt-2">Measure and analyze tick-tock timing for precision clock repair</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ControlsPanel 
            recording={recording}
            recordingTime={recordingTime}
            audioDevices={audioDevices}
            selectedDeviceId={selectedDeviceId}
            detectionThreshold={detectionThreshold}
            noiseReduction={noiseReduction}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onDeviceChange={setSelectedDeviceId}
            onThresholdChange={setDetectionThreshold}
            onNoiseReductionChange={setNoiseReduction}
          />
          
          <div className="lg:col-span-2 space-y-6">
            <SpectrogramVisualizer 
              spectrogramData={spectrogramData}
            />
            
            <WaveformVisualizer 
              waveformData={waveformData}
              detectedSounds={detectedSounds}
            />
            
            <TimingAnalysis 
              measurements={measurements}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

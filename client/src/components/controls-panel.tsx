import RecordingStatus from "./recording-status";
import RecordingControls from "./recording-controls";
import AudioInputSelector from "./audio-input-selector";
import SensitivityControls from "./sensitivity-controls";

interface ControlsPanelProps {
  recording: boolean;
  recordingTime: string;
  audioDevices: MediaDeviceInfo[];
  selectedDeviceId: string;
  detectionThreshold: number;
  noiseReduction: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onDeviceChange: (deviceId: string) => void;
  onThresholdChange: (value: number) => void;
  onNoiseReductionChange: (value: number) => void;
}

export default function ControlsPanel({
  recording,
  recordingTime,
  audioDevices,
  selectedDeviceId,
  detectionThreshold,
  noiseReduction,
  onStartRecording,
  onStopRecording,
  onDeviceChange,
  onThresholdChange,
  onNoiseReductionChange
}: ControlsPanelProps) {
  return (
    <div className="lg:col-span-1 bg-slate-800 rounded-lg p-6 shadow-lg flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
        <span className="material-icons mr-2">settings</span>
        Controls
      </h2>
      
      <div className="space-y-6">
        <RecordingStatus 
          recording={recording}
          recordingTime={recordingTime}
        />
        
        <RecordingControls 
          recording={recording} 
          onStartRecording={onStartRecording}
          onStopRecording={onStopRecording}
        />
        
        <AudioInputSelector 
          devices={audioDevices}
          selectedDeviceId={selectedDeviceId}
          onDeviceChange={onDeviceChange}
        />
        
        <SensitivityControls 
          detectionThreshold={detectionThreshold}
          noiseReduction={noiseReduction}
          onThresholdChange={onThresholdChange}
          onNoiseReductionChange={onNoiseReductionChange}
        />
      </div>
      
      <div className="mt-auto pt-6">
        <div className="bg-slate-700/50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-slate-300 flex items-center">
            <span className="material-icons text-blue-400 mr-2 text-sm">info</span>
            How to use
          </h3>
          <ol className="text-xs text-slate-400 mt-2 space-y-1 list-decimal list-inside">
            <li>Position microphone near the clock</li>
            <li>Press Start Recording to begin analysis</li>
            <li>Wait for at least 10 tick-tock cycles</li>
            <li>Review the intervals between sounds</li>
            <li>Adjust clock as needed and repeat</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

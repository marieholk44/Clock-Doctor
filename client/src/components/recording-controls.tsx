interface RecordingControlsProps {
  recording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export default function RecordingControls({ 
  recording, 
  onStartRecording, 
  onStopRecording 
}: RecordingControlsProps) {
  return (
    <div className="flex space-x-3">
      <button 
        className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium flex items-center justify-center transition-colors ${recording ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={onStartRecording}
        disabled={recording}
      >
        <span className="material-icons mr-2">mic</span>
        Start Recording
      </button>
      <button 
        className={`flex-1 bg-slate-600 hover:bg-slate-700 text-white py-3 px-4 rounded-md font-medium flex items-center justify-center transition-colors ${!recording ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={onStopRecording}
        disabled={!recording}
      >
        <span className="material-icons mr-2">stop</span>
        Stop
      </button>
    </div>
  );
}

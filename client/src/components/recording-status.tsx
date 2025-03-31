interface RecordingStatusProps {
  recording: boolean;
  recordingTime: string;
}

export default function RecordingStatus({ recording, recordingTime }: RecordingStatusProps) {
  return (
    <div className="flex items-center justify-between bg-slate-700 p-4 rounded-md">
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full ${recording ? 'bg-red-500 animate-pulse' : 'bg-slate-400'} mr-3`}></div>
        <span>{recording ? 'Recording' : 'Ready'}</span>
      </div>
      <span className="font-mono">{recordingTime}</span>
    </div>
  );
}

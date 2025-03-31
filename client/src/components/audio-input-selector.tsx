interface AudioInputSelectorProps {
  devices: MediaDeviceInfo[];
  selectedDeviceId: string;
  onDeviceChange: (deviceId: string) => void;
}

export default function AudioInputSelector({
  devices,
  selectedDeviceId,
  onDeviceChange
}: AudioInputSelectorProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="audio-input" className="block text-sm font-medium text-slate-300">
        Audio Input Device
      </label>
      <select
        id="audio-input"
        className="block w-full bg-slate-700 border-slate-600 text-white rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
        value={selectedDeviceId}
        onChange={(e) => onDeviceChange(e.target.value)}
      >
        {devices.length === 0 ? (
          <option value="">No devices found</option>
        ) : (
          devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Microphone (${device.deviceId.slice(0, 8)}...)`}
            </option>
          ))
        )}
      </select>
    </div>
  );
}

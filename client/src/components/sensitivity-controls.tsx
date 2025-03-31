interface SensitivityControlsProps {
  detectionThreshold: number;
  noiseReduction: number;
  onThresholdChange: (value: number) => void;
  onNoiseReductionChange: (value: number) => void;
}

export default function SensitivityControls({
  detectionThreshold,
  noiseReduction,
  onThresholdChange,
  onNoiseReductionChange
}: SensitivityControlsProps) {
  return (
    <div className="space-y-3">
      <div>
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="detection-threshold" className="block text-sm font-medium text-slate-300">
            Detection Threshold
          </label>
          <span className="text-xs text-slate-400" id="threshold-value">
            {detectionThreshold}%
          </span>
        </div>
        <input
          type="range"
          id="detection-threshold"
          className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
          min="0"
          max="100"
          value={detectionThreshold}
          onChange={(e) => onThresholdChange(parseInt(e.target.value))}
        />
        <p className="text-xs text-slate-400 mt-1">
          Adjust how sensitive the analyzer is to detecting tick-tock sounds
        </p>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="noise-reduction" className="block text-sm font-medium text-slate-300">
            Noise Reduction
          </label>
          <span className="text-xs text-slate-400" id="noise-value">
            {noiseReduction}%
          </span>
        </div>
        <input
          type="range"
          id="noise-reduction"
          className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
          min="0"
          max="100"
          value={noiseReduction}
          onChange={(e) => onNoiseReductionChange(parseInt(e.target.value))}
        />
        <p className="text-xs text-slate-400 mt-1">
          Filter out background noise
        </p>
      </div>
    </div>
  );
}

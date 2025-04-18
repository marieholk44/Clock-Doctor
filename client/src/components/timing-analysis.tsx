import { Measurement } from "@/hooks/use-audio-analyzer";

interface TimingAnalysisProps {
  measurements: Measurement[];
}

export default function TimingAnalysis({ measurements }: TimingAnalysisProps) {
  // Calculate statistics for sound intervals
  const calculateStats = () => {
    if (measurements.length === 0) {
      return {
        avgInterval: 0,
        avgFrequency: 0,
        minInterval: 0,
        maxInterval: 0,
        variance: 0,
        beatCount: 0,
        timingQuality: "No data"
      };
    }

    // Calculate sum, min, max for intervals
    let intervalSum = 0;
    let frequencySum = 0;
    let minInterval = Infinity;
    let maxInterval = 0;
    
    measurements.forEach(m => {
      intervalSum += m.intervalMs;
      frequencySum += m.frequency;
      
      if (m.intervalMs < minInterval) minInterval = m.intervalMs;
      if (m.intervalMs > maxInterval) maxInterval = m.intervalMs;
    });
    
    // Calculate averages
    const avgInterval = intervalSum / measurements.length;
    const avgFrequency = frequencySum / measurements.length;
    
    // Calculate variance (standard deviation)
    let varianceSum = 0;
    measurements.forEach(m => {
      varianceSum += Math.pow(m.intervalMs - avgInterval, 2);
    });
    
    const variance = Math.sqrt(varianceSum / measurements.length);
    
    // Calculate max deviation percentage
    const maxDeviation = Math.max(
      Math.abs((maxInterval - avgInterval) / avgInterval) * 100,
      Math.abs((minInterval - avgInterval) / avgInterval) * 100
    );
    
    // Determine timing quality
    let timingQuality = "Excellent";
    
    if (maxDeviation > 10) {
      timingQuality = "Poor - Needs adjustment";
    } else if (maxDeviation > 5) {
      timingQuality = "Fair - Minor inconsistency";
    } else if (maxDeviation > 2) {
      timingQuality = "Good - Slight variation";
    }
    
    return {
      avgInterval: (avgInterval / 1000).toFixed(3), // Convert to seconds
      avgFrequency: avgFrequency.toFixed(1),
      minInterval: (minInterval / 1000).toFixed(3), // Convert to seconds
      maxInterval: (maxInterval / 1000).toFixed(3), // Convert to seconds
      variance: (variance / 1000).toFixed(3), // Convert to seconds
      beatCount: measurements.length,
      timingQuality,
      maxDeviation: maxDeviation.toFixed(1)
    };
  };

  const stats = calculateStats();
  
  // Determine the color for timing quality
  const getTimingQualityColor = () => {
    if (stats.timingQuality.includes("Excellent")) return "text-green-400";
    if (stats.timingQuality.includes("Good")) return "text-blue-400";
    if (stats.timingQuality.includes("Fair")) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
        <span className="mr-2">⏱️</span>
        Timing Analysis
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-700 p-4 rounded-md">
          <h3 className="text-sm font-medium text-slate-300 mb-2">Average Interval</h3>
          <div className="flex items-baseline">
            <span className="text-2xl font-mono text-blue-400">{stats.avgInterval}</span>
            <span className="text-sm text-slate-400 ml-1">seconds</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            <span>Standard Deviation: ±{stats.variance}s</span>
          </div>
        </div>
        
        <div className="bg-slate-700 p-4 rounded-md">
          <h3 className="text-sm font-medium text-slate-300 mb-2">Frequency</h3>
          <div className="flex items-baseline">
            <span className="text-2xl font-mono text-green-400">{stats.avgFrequency}</span>
            <span className="text-sm text-slate-400 ml-1">BPM</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            <span>Calculated from interval average</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 bg-slate-700 p-4 rounded-md">
        <h3 className="text-sm font-medium text-slate-300 mb-2">Interval Range</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-medium text-slate-400">Minimum</div>
            <div className="text-xl font-mono text-amber-400">{stats.minInterval}s</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">Maximum</div>
            <div className="text-xl font-mono text-purple-400">{stats.maxInterval}s</div>
          </div>
        </div>
        <div className="flex justify-between text-xs mt-3">
          <span className="text-slate-400">Beats analyzed: {stats.beatCount}</span>
          <span className={`font-medium ${getTimingQualityColor()}`}>
            {stats.timingQuality !== "Excellent" && (
              <span className="text-xs align-text-top mr-1">⚠️</span>
            )}
            {stats.timingQuality} ({stats.maxDeviation}% max deviation)
          </span>
        </div>
      </div>
      
      {/* Sequential Interval Comparison - Make it more prominent */}
      <div className="bg-slate-700 rounded-lg p-4 shadow-inner border-l-4 border-blue-500">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-blue-300">Sound Interval Analysis</h3>
          <p className="text-xs text-slate-400 mt-1">Measures time between consecutive sound spikes (tick→tock→tick) in milliseconds</p>
        </div>
        <div className="overflow-x-auto rounded-md mt-3">
          <table className="min-w-full bg-slate-800 text-sm">
            <thead>
              <tr className="bg-slate-700 text-left border-b border-slate-600">
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">Time</th>
                <th className="py-2 px-3 text-blue-300">Interval (ms)</th>
                <th className="py-2 px-3 text-indigo-300">Previous (ms)</th>
                <th className="py-2 px-3 text-yellow-300">Change</th>
                <th className="py-2 px-3">Stability</th>
              </tr>
            </thead>
            <tbody>
              {measurements.length === 0 ? (
                <tr className="border-t border-slate-600 text-slate-300">
                  <td colSpan={6} className="py-4 px-3 text-center">No measurements recorded yet. Start recording to see interval comparisons.</td>
                </tr>
              ) : (
                measurements.slice(-5).map((measurement, index) => (
                  <tr key={index} className={`border-t border-slate-600 text-slate-300 font-mono ${
                    index === measurements.slice(-5).length - 1 ? 'bg-slate-700/30' : ''
                  }`}>
                    <td className="py-3 px-3">{measurements.length - 5 + index + 1}</td>
                    <td className="py-3 px-3">{measurement.time}</td>
                    <td className="py-3 px-3 text-blue-400 font-bold">{measurement.intervalMs} ms</td>
                    <td className="py-3 px-3 text-indigo-300">
                      {measurement.previousIntervalMs 
                        ? `${measurement.previousIntervalMs} ms`
                        : '-'}
                    </td>
                    <td className={`py-3 px-3 font-bold ${
                      measurement.changeFromPrevious === undefined 
                        ? 'text-gray-400' 
                        : Math.abs(measurement.changeFromPrevious) < 1 
                          ? 'text-green-400'
                          : Math.abs(measurement.changeFromPrevious) < 3
                            ? 'text-amber-400'
                            : 'text-red-400'
                    }`}>
                      {measurement.changeFromPrevious !== undefined 
                        ? (measurement.changeFromPrevious > 0 ? '+' : '') + 
                          measurement.changeFromPrevious.toFixed(1) + '%'
                        : '-'}
                    </td>
                    <td className="py-3 px-3">
                      {measurement.changeFromPrevious === undefined ? (
                        <span className="text-gray-400">-</span>
                      ) : Math.abs(measurement.changeFromPrevious) < 1 ? (
                        <span className="text-green-400 font-medium">✓ Consistent</span>
                      ) : Math.abs(measurement.changeFromPrevious) < 3 ? (
                        <span className="text-amber-400 font-medium">⚠️ Minor Drift</span>
                      ) : Math.abs(measurement.changeFromPrevious) < 5 ? (
                        <span className="text-orange-400 font-medium">⚠️ Significant</span>
                      ) : (
                        <span className="text-red-400 font-medium">❌ Unstable</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {measurements.length > 0 && (
          <div className="mt-3 text-xs text-slate-400 flex justify-between items-center">
            <span className="italic">Last {Math.min(measurements.length, 5)} measurements shown</span>
            
            <div className="flex gap-4">
              <span className="text-green-400">✓ &lt;1% = Excellent</span>
              <span className="text-amber-400">⚠️ 1-3% = Minor Issue</span>
              <span className="text-red-400">❌ &gt;5% = Needs Repair</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <h3 className="text-sm font-medium text-slate-300 mb-2">
          <span className="mr-2">📈</span>
          Measurement Details
        </h3>
        <div className="overflow-x-auto rounded-md">
          <table className="min-w-full bg-slate-700 text-sm">
            <thead>
              <tr className="bg-slate-600 text-left">
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">Time</th>
                <th className="py-2 px-3">Frequency</th>
                <th className="py-2 px-3">Deviation</th>
              </tr>
            </thead>
            <tbody>
              {measurements.length === 0 ? (
                <tr className="border-t border-slate-600 text-slate-300">
                  <td colSpan={4} className="py-2 px-3 text-center">No measurements recorded</td>
                </tr>
              ) : (
                measurements.slice(-5).map((measurement, index) => (
                  <tr key={index} className="border-t border-slate-600 text-slate-300 font-mono">
                    <td className="py-2 px-3">{measurements.length - 5 + index + 1}</td>
                    <td className="py-2 px-3">{measurement.time}</td>
                    <td className="py-2 px-3 text-green-400">{measurement.frequency.toFixed(1)} BPM</td>
                    <td className={`py-2 px-3 ${Math.abs(measurement.deviation) > 5 ? 'text-red-400' : 'text-amber-400'}`}>
                      {measurement.deviation > 0 ? '+' : ''}{measurement.deviation.toFixed(1)}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

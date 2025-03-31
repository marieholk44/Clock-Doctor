import { Measurement } from "@/hooks/use-audio-analyzer";

interface TimingAnalysisProps {
  measurements: Measurement[];
}

export default function TimingAnalysis({ measurements }: TimingAnalysisProps) {
  // Calculate averages and variances
  const calculateStats = () => {
    if (measurements.length === 0) {
      return {
        tickToTock: 0,
        tockToTick: 0,
        fullCycle: 0,
        tickToTockVariance: 0,
        tockToTickVariance: 0,
        cycleCount: 0,
        timingQuality: "No data"
      };
    }

    // Sum up the intervals
    let tickToTockSum = 0;
    let tockToTickSum = 0;
    let fullCycleSum = 0;
    
    measurements.forEach(m => {
      tickToTockSum += m.tickToTock;
      tockToTickSum += m.tockToTick;
      fullCycleSum += m.fullCycle;
    });
    
    // Calculate averages
    const tickToTock = tickToTockSum / measurements.length;
    const tockToTick = tockToTickSum / measurements.length;
    const fullCycle = fullCycleSum / measurements.length;
    
    // Calculate variances
    let tickToTockVarianceSum = 0;
    let tockToTickVarianceSum = 0;
    
    measurements.forEach(m => {
      tickToTockVarianceSum += Math.pow(m.tickToTock - tickToTock, 2);
      tockToTickVarianceSum += Math.pow(m.tockToTick - tockToTick, 2);
    });
    
    const tickToTockVariance = Math.sqrt(tickToTockVarianceSum / measurements.length);
    const tockToTickVariance = Math.sqrt(tockToTickVarianceSum / measurements.length);
    
    // Determine timing quality
    let timingQuality = "Perfect";
    if (Math.abs(tickToTock - tockToTick) > 0.05) {
      timingQuality = "Significant inconsistency";
    } else if (Math.abs(tickToTock - tockToTick) > 0.01) {
      timingQuality = "Minor inconsistency";
    }
    
    return {
      tickToTock: tickToTock.toFixed(3),
      tockToTick: tockToTick.toFixed(3),
      fullCycle: fullCycle.toFixed(3),
      tickToTockVariance: tickToTockVariance.toFixed(3),
      tockToTickVariance: tockToTickVariance.toFixed(3),
      cycleCount: measurements.length,
      timingQuality
    };
  };

  const stats = calculateStats();
  
  // Determine the color for timing quality
  const getTimingQualityColor = () => {
    if (stats.timingQuality === "Perfect") return "text-green-400";
    if (stats.timingQuality === "Minor inconsistency") return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
        <span className="material-icons mr-2">assessment</span>
        Timing Analysis
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-700 p-4 rounded-md">
          <h3 className="text-sm font-medium text-slate-300 mb-2">Tick-to-Tock Interval</h3>
          <div className="flex items-baseline">
            <span className="text-2xl font-mono text-blue-400">{stats.tickToTock}</span>
            <span className="text-sm text-slate-400 ml-1">seconds</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            <span>Variance: ±{stats.tickToTockVariance}s</span>
          </div>
        </div>
        
        <div className="bg-slate-700 p-4 rounded-md">
          <h3 className="text-sm font-medium text-slate-300 mb-2">Tock-to-Tick Interval</h3>
          <div className="flex items-baseline">
            <span className="text-2xl font-mono text-green-400">{stats.tockToTick}</span>
            <span className="text-sm text-slate-400 ml-1">seconds</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            <span>Variance: ±{stats.tockToTickVariance}s</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 bg-slate-700 p-4 rounded-md">
        <h3 className="text-sm font-medium text-slate-300 mb-2">Complete Cycle (Tick-to-Tick)</h3>
        <div className="flex items-baseline">
          <span className="text-2xl font-mono text-purple-400">{stats.fullCycle}</span>
          <span className="text-sm text-slate-400 ml-1">seconds</span>
        </div>
        <div className="flex justify-between text-xs mt-2">
          <span className="text-slate-400">Cycles recorded: {stats.cycleCount}</span>
          <span className={`font-medium ${getTimingQualityColor()}`}>
            {stats.timingQuality !== "Perfect" && (
              <span className="material-icons text-xs align-text-top">warning</span>
            )}
            {stats.timingQuality}
          </span>
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-sm font-medium text-slate-300 mb-2">Recent Measurements</h3>
        <div className="overflow-x-auto rounded-md">
          <table className="min-w-full bg-slate-700 text-sm">
            <thead>
              <tr className="bg-slate-600 text-left">
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">Time</th>
                <th className="py-2 px-3">Tick-to-Tock</th>
                <th className="py-2 px-3">Tock-to-Tick</th>
                <th className="py-2 px-3">Full Cycle</th>
              </tr>
            </thead>
            <tbody>
              {measurements.length === 0 ? (
                <tr className="border-t border-slate-600 text-slate-300">
                  <td colSpan={5} className="py-2 px-3 text-center">No measurements recorded</td>
                </tr>
              ) : (
                measurements.slice(-5).map((measurement, index) => (
                  <tr key={index} className="border-t border-slate-600 text-slate-300 font-mono">
                    <td className="py-2 px-3">{index + 1}</td>
                    <td className="py-2 px-3">{measurement.time}</td>
                    <td className="py-2 px-3 text-blue-400">{measurement.tickToTock.toFixed(3)}s</td>
                    <td className="py-2 px-3 text-green-400">{measurement.tockToTick.toFixed(3)}s</td>
                    <td className="py-2 px-3 text-purple-400">{measurement.fullCycle.toFixed(3)}s</td>
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

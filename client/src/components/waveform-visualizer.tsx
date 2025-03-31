import { useEffect, useRef } from "react";
import { DetectedSound } from "@/lib/audio-processor";

interface WaveformVisualizerProps {
  waveformData: Uint8Array | null;
  detectedSounds: DetectedSound[];
}

export default function WaveformVisualizer({ 
  waveformData, 
  detectedSounds 
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Debug what data we're receiving
    if (waveformData) {
      console.log(`Waveform data received, length: ${waveformData.length}, 
        sample values: ${waveformData[0]}, ${waveformData[1]}, ${waveformData[2]}`);
    } else {
      console.log('No waveform data received');
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions - important to get correct rendering
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.fillStyle = '#0f172a'; // bg-slate-900
    ctx.fillRect(0, 0, width, height);
    
    // Draw center line
    ctx.strokeStyle = '#334155'; // text-slate-600
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    // Draw waveform
    if (waveformData && waveformData.length > 0) {
      ctx.strokeStyle = '#60a5fa'; // blue-400
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      // Take a reasonable number of points to display
      const pointsToDisplay = Math.min(waveformData.length, 1024);
      const step = Math.floor(waveformData.length / pointsToDisplay) || 1;
      const sliceWidth = width / (pointsToDisplay);
      
      let x = 0;
      
      for (let i = 0; i < waveformData.length; i += step) {
        // Convert from [0, 255] to [-1, 1] for proper centering
        const normalized = (waveformData[i] / 128.0) - 1;
        
        // Note the inverted y-axis (canvas y increases downward)
        // and the centering around the middle of the canvas
        const y = (height / 2) * (1 - normalized);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
      }
      
      ctx.stroke();
    } else {
      // Draw a flat line in the middle if no data
      ctx.strokeStyle = '#60a5fa80'; // blue-400 with transparency 
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      
      // Add placeholder text
      ctx.fillStyle = 'rgba(148, 163, 184, 0.7)'; // slate-400 with transparency
      ctx.font = '14px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Waiting for audio...', width / 2, height / 2 - 20);
    }
  }, [waveformData]);

  const getMarkerPosition = (timestamp: number, duration: number) => {
    if (!canvasRef.current) return { left: "0%", display: "none" };
    
    // Calculate position based on timestamp relative to duration
    const position = (timestamp / duration) * 100;
    
    // Don't display if out of range
    if (position < 0 || position > 100) {
      return { left: "0%", display: "none" };
    }
    
    return { 
      left: `${position}%`, 
      transform: "translateX(-50%)", 
      top: "5px" 
    };
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <span className="mr-2">📊</span>
          Waveform Analysis
        </h2>
        
        <div className="flex gap-4 text-xs text-slate-400">
          <div className="flex items-center">
            <div className="h-3 w-3 bg-blue-500/30 border border-blue-500 rounded-full mr-1"></div>
            <span>Detected Sound Pulse</span>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-4 bg-green-400 mr-1"></div>
            <span>Measurement Point</span>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <canvas 
          ref={canvasRef} 
          className="w-full h-32 bg-slate-900 rounded-md"
        />
        
        {/* Sound markers with tooltips */}
        {detectedSounds.map((sound, index) => (
          <div 
            key={index}
            className="absolute" 
            style={getMarkerPosition(sound.timestamp, 3)}
            title={`Sound ${index + 1}: Timestamp ${sound.timestamp.toFixed(3)}s, Magnitude: ${sound.magnitude.toFixed(2)}`}
          >
            <div className="h-5 w-5 bg-blue-500/30 border border-blue-500 rounded-full flex items-center justify-center group">
              <span className="text-[10px] font-bold">
                {index + 1}
              </span>
              
              {/* Show interval if we have at least 2 sounds */}
              {index > 0 && (
                <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 hidden group-hover:block 
                              bg-slate-700 text-xs text-white p-1 rounded whitespace-nowrap">
                  {((sound.timestamp - detectedSounds[index - 1].timestamp) * 1000).toFixed(0)} ms
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex mt-3 text-xs text-slate-400 justify-between">
        <span>0s</span>
        <span>1s</span>
        <span>2s</span>
        <span>3s</span>
      </div>
      
      {/* Explanation text */}
      <div className="mt-3 text-xs text-slate-400">
        <p>Visualizes audio waveform and marks each detected sound pulse. Hover over markers to see the interval between consecutive sounds.</p>
      </div>
    </div>
  );
}

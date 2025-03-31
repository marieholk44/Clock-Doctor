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
      
      const sliceWidth = width / waveformData.length;
      let x = 0;
      
      for (let i = 0; i < waveformData.length; i++) {
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
      <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
        <span className="mr-2">📊</span>
        Waveform &amp; Detected Sounds
      </h2>
      
      <div className="relative">
        <canvas 
          ref={canvasRef} 
          className="w-full h-32 bg-slate-900 rounded-md"
        />
        
        {detectedSounds.map((sound, index) => (
          <div 
            key={index}
            className="absolute" 
            style={getMarkerPosition(sound.timestamp, 3)}
          >
            <div className="h-5 w-5 bg-blue-500/30 border border-blue-500 rounded-full flex items-center justify-center">
              <span className="text-[10px] font-bold">
                {index + 1}
              </span>
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
    </div>
  );
}

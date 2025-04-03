import { useEffect, useRef } from "react";

interface SpectrogramVisualizerProps {
  spectrogramData: Uint8Array | null;
}

export default function SpectrogramVisualizer({ spectrogramData }: SpectrogramVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Log data receive in console
  useEffect(() => {
    if (spectrogramData) {
      console.log(`Setting spectrogram data, length: ${spectrogramData.length}, has content: ${spectrogramData.some(v => v > 0)}`);
    }
  }, [spectrogramData]);
  
  // Render visualization
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Ensure canvas dimensions match its display size
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;
    
    // Clear the canvas
    ctx.fillStyle = '#0f172a'; // bg-slate-900
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid lines
    ctx.strokeStyle = '#334155'; // text-slate-600
    ctx.lineWidth = 1;
    
    // Horizontal grid lines (frequency bands)
    for (let y = 0; y < height; y += height / 5) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Vertical grid lines (time) - 5 divisions for 10 seconds (every 2 seconds)
    for (let x = 0; x < width; x += width / 5) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    if (spectrogramData && spectrogramData.length > 0) {
      // Determine if this is the new format (time-based 2D data)
      // or the old format (single frequency analysis)
      const frequencyBins = 256;
      const isTimeFormatted = spectrogramData.length % frequencyBins === 0;
      
      if (isTimeFormatted) {
        // This is the new 2D time-frequency data
        const timeSteps = Math.floor(spectrogramData.length / frequencyBins); 
        
        // Calculate dimensions for visualization
        const binHeight = height / frequencyBins;
        const timeWidth = width / timeSteps;
        
        // Get color based on intensity
        const getColor = (value: number) => {
          const normalized = Math.min(1, value / 150);
          
          if (normalized < 0.3) {
            return `rgba(30, 64, 175, ${normalized * 2})`; // Dim blue (blue-800)
          } else if (normalized < 0.6) {
            return `rgba(59, 130, 246, ${normalized * 1.5})`; // Medium blue (blue-500)
          } else {
            // Transition to white for high intensity
            const r = Math.min(255, 59 + (196 * (normalized - 0.6) / 0.4));
            const g = Math.min(255, 130 + (125 * (normalized - 0.6) / 0.4));
            const b = 246;
            return `rgba(${r}, ${g}, ${b}, 1)`;
          }
        };
        
        // Draw time-frequency spectrogram
        for (let t = 0; t < timeSteps; t++) {
          for (let f = 0; f < frequencyBins; f++) {
            const index = t * frequencyBins + f;
            let value = spectrogramData[index] || 0;
            
            // Amplify values for better visualization
            value = Math.min(255, value * 1.5);
            
            // Skip drawing very low values for performance
            if (value < 5) continue;
            
            // Draw the frequency bin
            const x = t * timeWidth;
            // Invert y-axis (higher freq at top)
            // Only draw lower half (more relevant frequencies for clock)
            const y = height - (f * binHeight * 2);
            if (y < 0) continue; // Skip if outside visible area
            
            // Use color based on intensity
            ctx.fillStyle = getColor(value);
            ctx.fillRect(x, y, timeWidth + 0.5, binHeight * 2 + 0.5);
          }
        }
        
        // Add time markers
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(width - timeWidth, 0);
        ctx.lineTo(width - timeWidth, height);
        ctx.stroke();
        
        // Add explanatory text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '10px system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('now', width - 2, 12);
        ctx.textAlign = 'left';
        ctx.fillText('past', 2, 12);
        
        // Add time scale
        const totalTimeSeconds = 10; // Based on 40 frames at 4fps = 0.25s per frame
        ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
        ctx.textAlign = 'center';
        ctx.fillText(`${totalTimeSeconds.toFixed(1)}s time window`, width / 2, height - 4);
      } else {
        // Original single-frame frequency analysis (fallback)
        const barWidth = width / Math.min(spectrogramData.length, 256);
        
        for (let i = 0; i < Math.min(spectrogramData.length, 256); i++) {
          const value = spectrogramData[i];
          const barHeight = (value / 255) * height;
          const x = i * barWidth;
          const y = height - barHeight;
          
          // Blue gradient based on intensity
          const intensity = value / 255;
          ctx.fillStyle = `rgba(59, 130, 246, ${intensity})`;
          ctx.fillRect(x, y, barWidth, barHeight);
        }
      }
    } else {
      // Draw placeholder when no data
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(30, 58, 138, 0.1)'); // Very faint blue
      gradient.addColorStop(1, 'rgba(30, 58, 138, 0.4)'); // Slightly more visible at bottom
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      ctx.fillStyle = 'rgba(148, 163, 184, 0.7)'; // slate-400 with transparency
      ctx.font = '14px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Waiting for audio...', width / 2, height / 2);
    }
  }, [spectrogramData]);

  return (
    <div className="w-full h-full">
      <div className="relative h-full">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full bg-slate-900 rounded-md"
        />
        
        <div className="absolute bottom-2 right-2 bg-slate-800/80 text-xs text-slate-300 px-2 py-1 rounded">
          <span>0 - 2000 Hz</span>
        </div>
        
        <div className="absolute top-2 left-2 bg-slate-800/80 text-xs text-slate-300 px-2 py-1 rounded">
          <span className="text-blue-400 font-medium">past</span>
          <span className="mx-2">←</span>
          <span className="text-white font-medium">Time</span>
          <span className="mx-2">→</span>
          <span className="text-blue-400 font-medium">now</span>
        </div>
        
        <div className="absolute top-2 right-2 bg-blue-900/60 text-xs text-white px-2 py-1 rounded">
          <span>10 second window</span>
        </div>
      </div>
      
      <div className="mt-3 flex justify-between text-xs text-slate-400">
        <span>0s</span>
        <span>2s</span>
        <span>4s</span>
        <span>6s</span>
        <span>8s</span>
        <span>10s</span>
      </div>
    </div>
  );
}

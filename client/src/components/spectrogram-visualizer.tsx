import { useEffect, useRef } from "react";

interface SpectrogramVisualizerProps {
  spectrogramData: Uint8Array | null;
}

export default function SpectrogramVisualizer({ spectrogramData }: SpectrogramVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
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
    
    // Vertical grid lines (time)
    for (let x = 0; x < width; x += width / 12) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Draw frequency data
    if (spectrogramData && spectrogramData.length > 0) {
      // Only display a subset focused on clock-relevant frequencies
      // Most mechanical clock sounds are in the 300-2000Hz range
      const relevantBins = Math.min(spectrogramData.length, 256);
      const barWidth = width / relevantBins;
      
      // Use a color scheme that highlights intensity
      const getIntensityColor = (value: number) => {
        // Normalize the value between 0 and 1
        const normalized = Math.min(1, value / 200);
        
        // Create a blue-to-white color scheme
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
      
      for (let i = 0; i < relevantBins; i++) {
        // Apply a logarithmic scale to better visualize the full range
        const logValue = Math.log10(spectrogramData[i] + 1) * 80;
        const barHeight = Math.min(height, (logValue / 255) * height);
        const x = i * barWidth;
        const y = height - barHeight;
        
        // Use color based on intensity
        ctx.fillStyle = getIntensityColor(spectrogramData[i]);
        ctx.fillRect(x, y, barWidth, barHeight);
      }
    } else {
      // Draw placeholder gradient when no data
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(30, 58, 138, 0.1)'); // Very faint blue
      gradient.addColorStop(1, 'rgba(30, 58, 138, 0.4)'); // Slightly more visible at bottom
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Add placeholder text
      ctx.fillStyle = 'rgba(148, 163, 184, 0.7)'; // slate-400 with transparency
      ctx.font = '14px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Waiting for audio...', width / 2, height / 2);
    }
  }, [spectrogramData]);

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
        <span className="mr-2">🔊</span>
        Spectrogram
      </h2>
      
      <div className="relative">
        <canvas 
          ref={canvasRef} 
          className="w-full h-48 bg-slate-900 rounded-md"
        />
        
        <div className="absolute bottom-2 right-2 bg-slate-800/80 text-xs text-slate-300 px-2 py-1 rounded">
          <span>0 - 2000 Hz</span>
        </div>
      </div>
      
      <div className="mt-3 flex justify-between text-xs text-slate-400">
        <span>0s</span>
        <span>1s</span>
        <span>2s</span>
        <span>3s</span>
        <span>4s</span>
        <span>5s</span>
      </div>
    </div>
  );
}

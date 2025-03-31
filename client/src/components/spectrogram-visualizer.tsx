import { useEffect, useRef } from "react";

interface SpectrogramVisualizerProps {
  spectrogramData: Uint8Array | null;
}

export default function SpectrogramVisualizer({ spectrogramData }: SpectrogramVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current || !spectrogramData) return;
    
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
      const barWidth = width / spectrogramData.length;
      
      for (let i = 0; i < spectrogramData.length; i++) {
        const barHeight = (spectrogramData[i] / 255) * height;
        const x = i * barWidth;
        const y = height - barHeight;
        
        // Create gradient for frequency visualization
        const gradient = ctx.createLinearGradient(0, y, 0, height);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.9)'); // blue-500
        gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.5)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);
      }
    }
  }, [spectrogramData]);

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
        <span className="material-icons mr-2">equalizer</span>
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

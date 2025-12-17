import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';

interface PerformanceStats {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  drawCalls: number;
}

export const PerformanceMonitor = ({ onStatsUpdate }: { onStatsUpdate?: (stats: PerformanceStats) => void }) => {
  const { gl } = useThree();
  const frameCount = useRef(0);
  const lastTime = useRef(Date.now());
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 60,
    frameTime: 16.67,
    memoryUsage: 0,
    drawCalls: 0
  });

  useFrame(() => {
    frameCount.current++;
    const now = Date.now();
    const delta = now - lastTime.current;

    // Update stats every second
    if (delta >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / delta);
      const frameTime = delta / frameCount.current;
      
      // Get WebGL info
      const info = gl.info;
      const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
      
      const newStats = {
        fps,
        frameTime: Math.round(frameTime * 100) / 100,
        memoryUsage: Math.round(memoryUsage / 1024 / 1024), // MB
        drawCalls: info.render.calls
      };

      setStats(newStats);
      onStatsUpdate?.(newStats);

      // Reset counters
      frameCount.current = 0;
      lastTime.current = now;
    }
  });

  // Log performance warnings
  useEffect(() => {
    if (stats.fps < 30) {
      console.warn(`Low FPS detected: ${stats.fps}`);
    }
    if (stats.frameTime > 33) {
      console.warn(`High frame time: ${stats.frameTime}ms`);
    }
  }, [stats]);

  return null;
};

// Performance overlay component
export const PerformanceOverlay = () => {
  const [stats] = useState<PerformanceStats | null>(null);
  const [visible, setVisible] = useState(false);

  // Show/hide with Ctrl+P
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        setVisible(!visible);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [visible]);

  if (!visible || !stats) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 text-white text-xs font-mono p-2 rounded">
      <div>FPS: {stats.fps}</div>
      <div>Frame: {stats.frameTime}ms</div>
      <div>Memory: {stats.memoryUsage}MB</div>
      <div>Draws: {stats.drawCalls}</div>
      <div className="text-gray-400 mt-1">Ctrl+P to hide</div>
    </div>
  );
};
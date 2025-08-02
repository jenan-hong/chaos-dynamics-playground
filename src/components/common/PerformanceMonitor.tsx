import React, { useState } from 'react';
import { usePerformance } from '../../hooks/usePerformance';

const PerformanceMonitor: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const performance = usePerformance();

  const formatMemory = (bytes: number): string => {
    if (bytes === 0) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getFpsColor = (fps: number): string => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPerformanceIndicator = (renderTime: number): string => {
    if (renderTime <= 5) return 'text-green-400';
    if (renderTime <= 16) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`
        bg-chaos-surface/90 backdrop-blur-md border border-chaos-primary/20 rounded-lg
        transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-80' : 'w-auto'}
      `}>
        {/* 標題欄 */}
        <div 
          className="flex items-center justify-between p-3 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${getFpsColor(performance.fps)}`} />
            <span className="text-sm font-medium text-chaos-text">
              {isExpanded ? 'Performance Monitor' : `${performance.fps} FPS`}
            </span>
          </div>
          <svg 
            className={`w-4 h-4 text-chaos-text/60 transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* 詳細指標 */}
        <div className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        `}>
          <div className="px-3 pb-3 space-y-3">
            
            {/* FPS 指標 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-chaos-text/70">Frame Rate</span>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-mono ${getFpsColor(performance.fps)}`}>
                  {performance.fps.toFixed(1)} FPS
                </span>
                <div className="w-12 h-2 bg-chaos-bg rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      performance.fps >= 55 ? 'bg-green-400' : 
                      performance.fps >= 30 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${Math.min(performance.fps / 60 * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 渲染時間 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-chaos-text/70">Render Time</span>
              <span className={`text-sm font-mono ${getPerformanceIndicator(performance.renderTime)}`}>
                {performance.renderTime.toFixed(2)} ms
              </span>
            </div>

            {/* 計算時間 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-chaos-text/70">Calculation</span>
              <span className={`text-sm font-mono ${getPerformanceIndicator(performance.calculationTime)}`}>
                {performance.calculationTime.toFixed(2)} ms
              </span>
            </div>

            {/* 記憶體使用 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-chaos-text/70">Memory Usage</span>
              <span className="text-sm font-mono text-chaos-accent">
                {formatMemory(performance.memoryUsage)}
              </span>
            </div>

            {/* 點數量 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-chaos-text/70">Points</span>
              <span className="text-sm font-mono text-chaos-secondary">
                {performance.pointCount.toLocaleString()}
              </span>
            </div>

            {/* 性能建議 */}
            <div className="pt-2 border-t border-chaos-primary/20">
              <div className="text-xs text-chaos-text/60">
                {performance.fps < 30 && (
                  <div className="text-red-400">⚠ Low FPS detected</div>
                )}
                {performance.renderTime > 16 && (
                  <div className="text-yellow-400">⚠ High render time</div>
                )}
                {performance.fps >= 55 && performance.renderTime <= 5 && (
                  <div className="text-green-400">✓ Optimal performance</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
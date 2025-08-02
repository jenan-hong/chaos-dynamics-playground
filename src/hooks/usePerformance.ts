import { useState, useCallback, useRef, useEffect } from 'react';
import { PerformanceMetrics } from '../types/systems';

interface UsePerformanceReturn extends PerformanceMetrics {
  startRenderTiming: () => void;
  endRenderTiming: () => void;
  startCalculationTiming: () => void;
  endCalculationTiming: () => void;
  updatePointCount: (count: number) => void;
  reset: () => void;
}

export const usePerformance = (): UsePerformanceReturn => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    renderTime: 0,
    calculationTime: 0,
    memoryUsage: 0,
    pointCount: 0,
    lastUpdate: Date.now()
  });

  const renderStartRef = useRef<number>(0);
  const calculationStartRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(performance.now());

  // FPS 計算
  const updateFps = useCallback(() => {
    frameCountRef.current++;
    const now = performance.now();
    
    if (now - lastFpsUpdateRef.current >= 1000) {
      const fps = frameCountRef.current * 1000 / (now - lastFpsUpdateRef.current);
      
      setMetrics(prev => ({
        ...prev,
        fps: Math.round(fps),
        lastUpdate: Date.now()
      }));
      
      frameCountRef.current = 0;
      lastFpsUpdateRef.current = now;
    }
  }, []);

  // 記憶體使用監控
  const updateMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memory.usedJSHeapSize,
        lastUpdate: Date.now()
      }));
    }
  }, []);

  // 渲染時間測量
  const startRenderTiming = useCallback(() => {
    renderStartRef.current = performance.now();
  }, []);

  const endRenderTiming = useCallback(() => {
    const renderTime = performance.now() - renderStartRef.current;
    setMetrics(prev => ({
      ...prev,
      renderTime: Math.round(renderTime * 100) / 100,
      lastUpdate: Date.now()
    }));
    updateFps();
  }, [updateFps]);

  // 計算時間測量
  const startCalculationTiming = useCallback(() => {
    calculationStartRef.current = performance.now();
  }, []);

  const endCalculationTiming = useCallback(() => {
    const calculationTime = performance.now() - calculationStartRef.current;
    setMetrics(prev => ({
      ...prev,
      calculationTime: Math.round(calculationTime * 100) / 100,
      lastUpdate: Date.now()
    }));
  }, []);

  // 更新點數量
  const updatePointCount = useCallback((count: number) => {
    setMetrics(prev => ({
      ...prev,
      pointCount: count,
      lastUpdate: Date.now()
    }));
  }, []);

  // 重置所有指標
  const reset = useCallback(() => {
    setMetrics({
      fps: 0,
      renderTime: 0,
      calculationTime: 0,
      memoryUsage: 0,
      pointCount: 0,
      lastUpdate: Date.now()
    });
    frameCountRef.current = 0;
    lastFpsUpdateRef.current = performance.now();
  }, []);

  // 定期更新記憶體使用
  useEffect(() => {
    const interval = setInterval(updateMemoryUsage, 2000);
    return () => clearInterval(interval);
  }, [updateMemoryUsage]);

  return {
    ...metrics,
    startRenderTiming,
    endRenderTiming,
    startCalculationTiming,
    endCalculationTiming,
    updatePointCount,
    reset
  };
};
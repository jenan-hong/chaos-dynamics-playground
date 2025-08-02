import { useState, useCallback, useRef, useEffect } from 'react';

interface UseAnimationReturn {
  isRunning: boolean;
  fps: number;
  frameCount: number;
  deltaTime: number;
  startAnimation: () => void;
  stopAnimation: () => void;
  toggleAnimation: () => void;
  setAnimationCallback: (callback: (deltaTime: number) => void) => void;
}

export const useAnimation = (): UseAnimationReturn => {
  const [isRunning, setIsRunning] = useState(false);
  const [fps, setFps] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [deltaTime, setDeltaTime] = useState(0);

  const animationIdRef = useRef<number | null>(null);
  const callbackRef = useRef<((deltaTime: number) => void) | null>(null);
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const fpsUpdateTimeRef = useRef<number>(0);

  const animate = useCallback((currentTime: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = currentTime;
      fpsUpdateTimeRef.current = currentTime;
    }

    const delta = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    // 更新 frame count
    frameCountRef.current++;
    setFrameCount(frameCountRef.current);

    // 計算 FPS (每秒更新一次)
    if (currentTime - fpsUpdateTimeRef.current >= 1000) {
      const currentFps = frameCountRef.current * 1000 / (currentTime - fpsUpdateTimeRef.current);
      setFps(Math.round(currentFps));
      frameCountRef.current = 0;
      fpsUpdateTimeRef.current = currentTime;
    }

    // 設置 delta time (轉換為秒)
    const deltaInSeconds = delta / 1000;
    setDeltaTime(deltaInSeconds);

    // 執行動畫回調
    if (callbackRef.current) {
      try {
        callbackRef.current(deltaInSeconds);
      } catch (error) {
        console.error('Animation callback error:', error);
      }
    }

    // 繼續動畫循環
    if (animationIdRef.current !== null) {
      animationIdRef.current = requestAnimationFrame(animate);
    }
  }, []);

  const startAnimation = useCallback(() => {
    if (isRunning || animationIdRef.current !== null) return;

    setIsRunning(true);
    lastTimeRef.current = 0;
    frameCountRef.current = 0;
    fpsUpdateTimeRef.current = performance.now();
    animationIdRef.current = requestAnimationFrame(animate);
  }, [isRunning, animate]);

  const stopAnimation = useCallback(() => {
    if (!isRunning && animationIdRef.current === null) return;

    setIsRunning(false);
    if (animationIdRef.current !== null) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
  }, [isRunning]);

  const toggleAnimation = useCallback(() => {
    if (isRunning) {
      stopAnimation();
    } else {
      startAnimation();
    }
  }, [isRunning, startAnimation, stopAnimation]);

  const setAnimationCallback = useCallback((callback: (deltaTime: number) => void) => {
    callbackRef.current = callback;
  }, []);

  // 清理函數
  useEffect(() => {
    return () => {
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
    };
  }, []);

  // 當組件卸載時停止動畫
  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, [stopAnimation]);

  return {
    isRunning,
    fps,
    frameCount,
    deltaTime,
    startAnimation,
    stopAnimation,
    toggleAnimation,
    setAnimationCallback
  };
};
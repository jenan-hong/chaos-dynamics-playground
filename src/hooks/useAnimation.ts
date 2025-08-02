// src/hooks/useAnimation.ts
import { useState, useCallback, useRef, useEffect } from 'react';

export const useAnimation = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [fps, setFps] = useState(0);
  const animationIdRef = useRef<number | null>(null);
  const callbackRef = useRef<(() => void) | null>(null);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(0);

  const animate = useCallback((currentTime: number) => {
    // 計算FPS
    frameCountRef.current++;
    if (currentTime - lastTimeRef.current >= 1000) {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
      lastTimeRef.current = currentTime;
    }

    // 執行動畫回調
    if (callbackRef.current) {
      callbackRef.current();
    }

    // 繼續動畫循環
    if (animationIdRef.current !== null) {
      animationIdRef.current = requestAnimationFrame(animate);
    }
  }, []);

  const startAnimation = useCallback(() => {
    if (isRunning) return;
    
    setIsRunning(true);
    lastTimeRef.current = performance.now();
    frameCountRef.current = 0;
    animationIdRef.current = requestAnimationFrame(animate);
  }, [isRunning, animate]);

  const stopAnimation = useCallback(() => {
    if (!isRunning) return;
    
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

  const setAnimationCallback = useCallback((callback: () => void) => {
    callbackRef.current = callback;
  }, []);

  useEffect(() => {
    return () => {
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  return {
    isRunning,
    fps,
    startAnimation,
    stopAnimation,
    toggleAnimation,
    setAnimationCallback
  };
};
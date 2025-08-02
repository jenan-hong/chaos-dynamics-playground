// src/hooks/useCanvas.ts (更新版本)
import { useRef, useCallback, useEffect, useState } from 'react';

export const useCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [isReady, setIsReady] = useState(false);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 獲取設備像素比，確保高DPI顯示清晰
    const dpr = window.devicePixelRatio || 1;
    
    // 獲取容器的實際尺寸
    const rect = canvas.getBoundingClientRect();
    const displayWidth = rect.width;
    const displayHeight = rect.height;

    // 設置畫布的實際尺寸（考慮設備像素比）
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;

    // 設置CSS顯示尺寸
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    const context = canvas.getContext('2d');
    if (!context) return;

    // 縮放繪圖上下文以匹配設備像素比
    context.scale(dpr, dpr);

    // 設置基本樣式
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.imageSmoothingEnabled = true;
    
    // 清除畫布
    context.fillStyle = '#000000';
    context.fillRect(0, 0, displayWidth, displayHeight);

    setCtx(context);
    setIsReady(true);
  }, []);

  const clearCanvas = useCallback(() => {
    if (!ctx || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, [ctx]);

  // 響應式調整大小
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      setupCanvas();
    });

    resizeObserver.observe(canvas);
    
    // 初始設置
    const timer = setTimeout(setupCanvas, 100);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, [setupCanvas]);

  return {
    canvasRef,
    ctx,
    isReady,
    setupCanvas,
    clearCanvas
  };
};
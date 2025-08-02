import { useRef, useCallback, useEffect, useState } from 'react';

interface UseCanvasReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  ctx: CanvasRenderingContext2D | null;
  setupCanvas: (width?: number, height?: number) => void;
  clearCanvas: () => void;
  resizeCanvas: () => void;
  getCanvasSize: () => { width: number; height: number };
  isReady: boolean;
}

export const useCanvas = (): UseCanvasReturn => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isReady, setIsReady] = useState(false);

  const setupCanvas = useCallback((width?: number, height?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 獲取設備像素比，確保高DPI顯示清晰
    const dpr = window.devicePixelRatio || 1;
    
    // 獲取容器尺寸或使用指定尺寸
    const rect = canvas.getBoundingClientRect();
    const canvasWidth = width || rect.width || 800;
    const canvasHeight = height || rect.height || 400;

    // 設置實際畫布尺寸（考慮設備像素比）
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;

    // 設置顯示尺寸
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    // 獲取並配置繪圖上下文
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // 縮放繪圖上下文以匹配設備像素比
      ctx.scale(dpr, dpr);
      
      // 設置預設樣式
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.imageSmoothingEnabled = true;
      
      // 初始化背景
      ctx.fillStyle = '#0f0f23';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      ctxRef.current = ctx;
      setIsReady(true);
    }
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // 清除並重新設置背景
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // 等待下一個渲染幀再設置，確保DOM已更新
    requestAnimationFrame(() => {
      setupCanvas();
    });
  }, [setupCanvas]);

  const getCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return { width: 0, height: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height
    };
  }, []);

  // 監聽窗口大小變化
  useEffect(() => {
    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [resizeCanvas]);

  // 初始化畫布 - 使用 ResizeObserver 確保正確尺寸
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      setupCanvas();
    });

    resizeObserver.observe(canvas);

    // 初始設置
    const timer = setTimeout(() => setupCanvas(), 100);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, [setupCanvas]);

  return {
    canvasRef,
    ctx: ctxRef.current,
    setupCanvas,
    clearCanvas,
    resizeCanvas,
    getCanvasSize,
    isReady
  };
};
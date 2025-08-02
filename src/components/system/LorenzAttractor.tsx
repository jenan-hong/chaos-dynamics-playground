// src/components/systems/LorenzAttractor.tsx (最終完整版本)
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useCanvas } from '../../hooks/useCanvas';
import { useAnimation } from '../../hooks/useAnimation';
import { LorenzSystem, Point3D } from '@/systems/math/LorenzSystem';

const LorenzAttractor: React.FC = () => {
  const { canvasRef, ctx, isReady, clearCanvas } = useCanvas();
  const { isRunning, fps, toggleAnimation, setAnimationCallback } = useAnimation();
  
  const [params, setParams] = useState({
    sigma: 10,
    rho: 28,
    beta: 2.67,
    scale: 6,
    speed: 3,
    trailLength: 2000
  });

  const [viewSettings, setViewSettings] = useState({
    rotationX: 0,
    rotationY: 0,
    offsetX: 0,
    offsetY: 0,
    zoom: 1
  });

  const lorenzSystemRef = useRef<LorenzSystem | null>(null);
  const trailPointsRef = useRef<Point3D[]>([]);

  // 初始化洛倫茲系統
  useEffect(() => {
    lorenzSystemRef.current = new LorenzSystem({
      sigma: params.sigma,
      rho: params.rho,
      beta: params.beta,
      dt: 0.01
    });
  }, []);

  // 更新系統參數
  useEffect(() => {
    if (lorenzSystemRef.current) {
      lorenzSystemRef.current.updateParams({
        sigma: params.sigma,
        rho: params.rho,
        beta: params.beta
      });
    }
  }, [params.sigma, params.rho, params.beta]);

  // 3D到2D投影函數
  const project3DTo2D = useCallback((point: Point3D, width: number, height: number) => {
    const { rotationX, rotationY, offsetX, offsetY, zoom } = viewSettings;
    
    // 簡單的3D旋轉
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    
    // 旋轉變換
    const rotatedY = point.y * cosX - point.z * sinX;
    const rotatedZ = point.y * sinX + point.z * cosX;
    const rotatedX = point.x * cosY + rotatedZ * sinY;
    const finalZ = -point.x * sinY + rotatedZ * cosY;
    
    // 投影到2D
    const scale = params.scale * zoom;
    const x = width / 2 + rotatedX * scale + offsetX;
    const y = height / 2 + rotatedY * scale + offsetY;
    
    return { x, y, z: finalZ };
  }, [viewSettings, params.scale]);

  // 洛倫茲吸引子繪製函數
  const drawLorenzAttractor = useCallback(() => {
    if (!ctx || !isReady || !canvasRef.current || !lorenzSystemRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // 清除畫布（帶有淡化效果以產生軌跡）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    ctx.fillRect(0, 0, width, height);

    // 計算新的點
    const newPoints = lorenzSystemRef.current.calculateSteps(params.speed);
    
    // 添加到軌跡中
    trailPointsRef.current.push(...newPoints);
    
    // 限制軌跡長度
    if (trailPointsRef.current.length > params.trailLength) {
      trailPointsRef.current = trailPointsRef.current.slice(-params.trailLength);
    }

    const points = trailPointsRef.current;

    if (points.length > 1) {
      // 繪製軌跡
      for (let i = 1; i < points.length; i++) {
        const prevPoint = points[i - 1];
        const currentPoint = points[i];
        
        // 3D投影
        const screen1 = project3DTo2D(prevPoint, width, height);
        const screen2 = project3DTo2D(currentPoint, width, height);
        
        // 計算深度效果
        const depth = (screen2.z + 50) / 100;
        const clampedDepth = Math.max(0.1, Math.min(1, depth));
        
        // 計算軌跡的漸變效果
        const alpha = Math.pow(i / points.length, 0.3) * 0.9 * clampedDepth;
        
        // 根據z坐標和深度改變顏色
        const hue = (currentPoint.z * 6 + screen2.z * 2 + 220) % 360;
        const saturation = 60 + clampedDepth * 30;
        const lightness = 40 + clampedDepth * 40;
        
        // 設置線條樣式
        ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
        ctx.lineWidth = Math.max(0.5, alpha * 3 * clampedDepth);
        
        ctx.beginPath();
        ctx.moveTo(screen1.x, screen1.y);
        ctx.lineTo(screen2.x, screen2.y);
        ctx.stroke();
      }
    }
    
    // 繪製當前點
    if (points.length > 0) {
      const current = points[points.length - 1];
      const screen = project3DTo2D(current, width, height);
      const depth = (screen.z + 50) / 100;
      const clampedDepth = Math.max(0.3, Math.min(1, depth));
      
      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${clampedDepth})`;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10 * clampedDepth;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, 3 * clampedDepth, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    }

    // 限制系統內部的軌跡長度
    lorenzSystemRef.current.limitTrailLength(params.trailLength);
  }, [ctx, isReady, canvasRef, params, project3DTo2D]);

  // 設置動畫回調
  useEffect(() => {
    setAnimationCallback(drawLorenzAttractor);
  }, [drawLorenzAttractor, setAnimationCallback]);

  const updateParam = (key: keyof typeof params, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const updateViewSetting = (key: keyof typeof viewSettings, value: number) => {
    setViewSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    if (lorenzSystemRef.current) {
      lorenzSystemRef.current.reset();
      trailPointsRef.current = [];
    }
    clearCanvas();
  };

  const handleExport = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `lorenz-attractor-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const handlePreset = (preset: string) => {
    switch (preset) {
      case 'classic':
        setParams(prev => ({ ...prev, sigma: 10, rho: 28, beta: 2.67 }));
        break;
      case 'butterfly':
        setParams(prev => ({ ...prev, sigma: 10, rho: 28, beta: 2.67, scale: 8 }));
        break;
      case 'chaotic':
        setParams(prev => ({ ...prev, sigma: 10, rho: 99.96, beta: 2.67 }));
        break;
    }
  };

  // 獲取當前位置用於顯示
  const getCurrentPosition = () => {
    if (lorenzSystemRef.current) {
      return lorenzSystemRef.current.getCurrentPosition();
    }
    return { x: 0, y: 0, z: 0 };
  };

  const currentPos = getCurrentPosition();
  const isChaotic = lorenzSystemRef.current?.isChaotic() ?? false;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-purple-400 mb-2">洛倫茲吸引子</h2>
        <p className="text-gray-300">探索著名的洛倫茲吸引子 - 蝴蝶效應的數學化身</p>
      </div>
      
      {/* Canvas區域 - 加大尺寸 */}
      <div className="relative">
        <canvas 
          ref={canvasRef}
          className="w-full bg-black rounded-lg border border-purple-500/20 cursor-crosshair"
          style={{ 
            height: '500px', // 明確設置高度
            minHeight: '500px',
            aspectRatio: '16/10'
          }}
        />
        
        {/* 狀態顯示 */}
        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-xs font-mono">
          <div className="text-green-400">FPS: {fps}</div>
          <div className="text-blue-400">X: {currentPos.x.toFixed(3)}</div>
          <div className="text-blue-400">Y: {currentPos.y.toFixed(3)}</div>
          <div className="text-blue-400">Z: {currentPos.z.toFixed(3)}</div>
          <div className="text-purple-400">Points: {trailPointsRef.current.length}</div>
          <div className={`${isChaotic ? 'text-red-400' : 'text-green-400'}`}>
            {isChaotic ? '混沌狀態' : '穩定狀態'}
          </div>
        </div>

        {/* 控制提示 */}
        <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-xs">
          <div className="text-gray-400">視角控制</div>
          <div className="text-gray-500">調整下方滑桿改變視角</div>
        </div>
      </div>
      
      {/* 預設按鈕 */}
      <div className="flex justify-center space-x-2 mb-4">
        <button
          onClick={() => handlePreset('classic')}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
        >
          經典參數
        </button>
        <button
          onClick={() => handlePreset('butterfly')}
          className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
        >
          蝴蝶效應
        </button>
        <button
          onClick={() => handlePreset('chaotic')}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
        >
          高度混沌
        </button>
      </div>

      {/* 系統參數控制 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-purple-400">系統參數</h3>
          <div className="space-x-2">
            <button
              onClick={toggleAnimation}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isRunning 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isRunning ? '停止' : '開始'}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              重置
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
            >
              導出
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              σ (Sigma): {params.sigma.toFixed(1)}
            </label>
            <input 
              type="range" 
              min="8" 
              max="12" 
              step="0.1" 
              value={params.sigma}
              onChange={(e) => updateParam('sigma', parseFloat(e.target.value))}
              className="w-full accent-purple-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ρ (Rho): {params.rho.toFixed(1)}
            </label>
            <input 
              type="range" 
              min="20" 
              max="35" 
              step="0.1" 
              value={params.rho}
              onChange={(e) => updateParam('rho', parseFloat(e.target.value))}
              className="w-full accent-purple-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              β (Beta): {params.beta.toFixed(2)}
            </label>
            <input 
              type="range" 
              min="1" 
              max="4" 
              step="0.01" 
              value={params.beta}
              onChange={(e) => updateParam('beta', parseFloat(e.target.value))}
              className="w-full accent-purple-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              速度: {params.speed}
            </label>
            <input 
              type="range" 
              min="1" 
              max="10" 
              step="1" 
              value={params.speed}
              onChange={(e) => updateParam('speed', parseInt(e.target.value))}
              className="w-full accent-purple-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              縮放: {params.scale}
            </label>
            <input 
              type="range" 
              min="3" 
              max="15" 
              step="1" 
              value={params.scale}
              onChange={(e) => updateParam('scale', parseInt(e.target.value))}
              className="w-full accent-purple-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              軌跡: {params.trailLength}
            </label>
            <input 
              type="range" 
              min="500" 
              max="3000" 
              step="100" 
              value={params.trailLength}
              onChange={(e) => updateParam('trailLength', parseInt(e.target.value))}
              className="w-full accent-purple-500" 
            />
          </div>
        </div>
      </div>

      {/* 視角控制 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-purple-400 mb-4">視角控制</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              X軸旋轉: {viewSettings.rotationX.toFixed(2)}
            </label>
            <input 
              type="range" 
              min="-3.14" 
              max="3.14" 
              step="0.01" 
              value={viewSettings.rotationX}
              onChange={(e) => updateViewSetting('rotationX', parseFloat(e.target.value))}
              className="w-full accent-blue-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Y軸旋轉: {viewSettings.rotationY.toFixed(2)}
            </label>
            <input 
              type="range" 
              min="-3.14" 
              max="3.14" 
              step="0.01" 
              value={viewSettings.rotationY}
              onChange={(e) => updateViewSetting('rotationY', parseFloat(e.target.value))}
              className="w-full accent-blue-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              X偏移: {viewSettings.offsetX}
            </label>
            <input 
              type="range" 
              min="-200" 
              max="200" 
              step="5" 
              value={viewSettings.offsetX}
              onChange={(e) => updateViewSetting('offsetX', parseInt(e.target.value))}
              className="w-full accent-blue-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Y偏移: {viewSettings.offsetY}
            </label>
            <input 
              type="range" 
              min="-200" 
              max="200" 
              step="5" 
              value={viewSettings.offsetY}
              onChange={(e) => updateViewSetting('offsetY', parseInt(e.target.value))}
              className="w-full accent-blue-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              縮放: {viewSettings.zoom.toFixed(1)}
            </label>
            <input 
              type="range" 
              min="0.5" 
              max="3" 
              step="0.1" 
              value={viewSettings.zoom}
              onChange={(e) => updateViewSetting('zoom', parseFloat(e.target.value))}
              className="w-full accent-blue-500" 
            />
          </div>
        </div>
      </div>

      {/* 數學方程顯示 */}
      <div className="bg-gray-900/50 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-purple-400 mb-3">洛倫茲方程組</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-green-900/20 p-3 rounded border border-green-500/20">
            <div className="text-green-400 font-mono text-sm">dx/dt = σ(y - x)</div>
            <div className="text-gray-400 text-xs mt-1">對流強度項</div>
          </div>
          <div className="bg-blue-900/20 p-3 rounded border border-blue-500/20">
            <div className="text-blue-400 font-mono text-sm">dy/dt = x(ρ - z) - y</div>
            <div className="text-gray-400 text-xs mt-1">溫度梯度項</div>
          </div>
          <div className="bg-red-900/20 p-3 rounded border border-red-500/20">
            <div className="text-red-400 font-mono text-sm">dz/dt = xy - βz</div>
            <div className="text-gray-400 text-xs mt-1">熱傳導項</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LorenzAttractor;
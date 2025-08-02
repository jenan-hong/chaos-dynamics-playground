import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useCanvas } from '../../hooks/useCanvas';
import { useAnimation } from '../../hooks/useAnimation';
import { usePerformance } from '../../hooks/usePerformance';
import { LorenzSystem } from '../../systems/math/LorenzSystem';
import { LorenzParams, Point3D } from '../../types/systems';
import ParameterSlider from '../controls/ParameterSlider';
import SystemInfo from '../controls/SystemInfo';
import ActionButtons from '../controls/ActionButtons';

const LorenzAttractor: React.FC = () => {
  const [params, setParams] = useState<LorenzParams>({
    sigma: 10,
    rho: 28,
    beta: 8/3,
    speed: 5,
    scale: 8,
    trailLength: 2000
  });

  const { canvasRef, ctx, isReady } = useCanvas();
  const { isRunning, toggleAnimation, setAnimationCallback } = useAnimation();
  const {
    startRenderTiming,
    endRenderTiming,
    startCalculationTiming,
    endCalculationTiming,
    updatePointCount
  } = usePerformance();

  const lorenzSystemRef = useRef<LorenzSystem | null>(null);
  const pointsRef = useRef<Point3D[]>([]);

  // 初始化洛倫茲系統
  useEffect(() => {
    lorenzSystemRef.current = new LorenzSystem(params);
  }, []);

  // 更新系統參數
  useEffect(() => {
    if (lorenzSystemRef.current) {
      lorenzSystemRef.current.updateParams(params);
    }
  }, [params]);

  // 渲染函數
  const render = useCallback(() => {
    if (!ctx || !lorenzSystemRef.current || !isReady) return;

    startRenderTiming();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // 清除畫布（漸變淡化效果）
    ctx.fillStyle = 'rgba(15, 15, 35, 0.05)';
    ctx.fillRect(0, 0, width, height);

    // 獲取所有點
    const points = pointsRef.current;
    
    if (points.length > 1) {
      // 繪製軌跡
      for (let i = 1; i < points.length; i++) {
        const prevPoint = points[i - 1];
        const currentPoint = points[i];
        
        // 將3D點投影到2D平面（使用x-y平面）
        const screenX1 = centerX + prevPoint.x * params.scale;
        const screenY1 = centerY + prevPoint.y * params.scale;
        const screenX2 = centerX + currentPoint.x * params.scale;
        const screenY2 = centerY + currentPoint.y * params.scale;
        
        // 計算軌跡的漸變效果
        const alpha = Math.pow(i / points.length, 0.5) * 0.8;
        const hue = (i * 0.5 + Date.now() * 0.01) % 360;
        
        // 設置線條樣式
        ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${alpha})`;
        ctx.lineWidth = Math.max(0.5, alpha * 2);
        
        ctx.beginPath();
        ctx.moveTo(screenX1, screenY1);
        ctx.lineTo(screenX2, screenY2);
        ctx.stroke();
      }
    }
    
    // 繪製當前點
    if (points.length > 0) {
      const current = points[points.length - 1];
      const screenX = centerX + current.x * params.scale;
      const screenY = centerY + current.y * params.scale;
      
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(screenX, screenY, 3, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    }

    endRenderTiming();
  }, [ctx, isReady, params.scale, startRenderTiming, endRenderTiming, canvasRef]);

  // 動畫循環
  const animationLoop = useCallback(() => {
    if (!lorenzSystemRef.current) return;

    startCalculationTiming();
    
    // 計算新點
    const newPoints = lorenzSystemRef.current.calculateSteps(params.speed);
    const allPoints = lorenzSystemRef.current.getPoints();
    
    // 更新點數組
    pointsRef.current = allPoints;
    updatePointCount(allPoints.length);
    
    endCalculationTiming();
    
    // 渲染
    render();
  }, [params.speed, startCalculationTiming, endCalculationTiming, updatePointCount, render]);

  // 設置動畫回調
  useEffect(() => {
    setAnimationCallback(animationLoop);
  }, [animationLoop, setAnimationCallback]);

  // 自動開始動畫
  useEffect(() => {
    if (isReady && !isRunning) {
      const timer = setTimeout(() => {
        toggleAnimation();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isReady, isRunning, toggleAnimation]);

  // 重置系統
  const handleReset = useCallback(() => {
    if (lorenzSystemRef.current) {
      lorenzSystemRef.current.reset();
      pointsRef.current = [];
    }
  }, []);

  // 導出數據
  const handleExport = useCallback(() => {
    const data = {
      system: 'lorenz',
      parameters: params,
      points: pointsRef.current,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lorenz-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [params]);

  // 參數更新處理
  const updateParam = useCallback((key: keyof LorenzParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className="space-y-6">
      {/* 系統描述 */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-chaos-primary mb-2">洛倫茲吸引子</h2>
        <p className="text-chaos-text/70">
          探索著名的洛倫茲吸引子 - 蝴蝶效應的數學化身
        </p>
      </div>

      {/* Canvas 容器 */}
      <div className="canvas-container relative">
        <canvas
          ref={canvasRef}
          className="w-full h-96 bg-transparent block"
          style={{ minHeight: '400px' }}
        />
        
        {/* 當前位置顯示 */}
        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-xs font-mono">
          {lorenzSystemRef.current ? (
            <>
              <div>X: {lorenzSystemRef.current.getCurrentPosition().x.toFixed(3)}</div>
              <div>Y: {lorenzSystemRef.current.getCurrentPosition().y.toFixed(3)}</div>
              <div>Z: {lorenzSystemRef.current.getCurrentPosition().z.toFixed(3)}</div>
            </>
          ) : (
            <>
              <div>X: 1.000</div>
              <div>Y: 1.000</div>
              <div>Z: 1.000</div>
            </>
          )}
        </div>

        {/* 加載指示器 */}
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-chaos-bg/50 backdrop-blur-sm">
            <div className="text-chaos-text/70">初始化中...</div>
          </div>
        )}
      </div>

      {/* 控制面板 */}
      <div className="control-panel">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <ParameterSlider
            label="σ (Sigma)"
            value={params.sigma}
            min={8}
            max={12}
            step={0.1}
            onChange={(value) => updateParam('sigma', value)}
          />
          <ParameterSlider
            label="ρ (Rho)"
            value={params.rho}
            min={20}
            max={35}
            step={0.1}
            onChange={(value) => updateParam('rho', value)}
          />
          <ParameterSlider
            label="β (Beta)"
            value={params.beta}
            min={1}
            max={4}
            step={0.1}
            onChange={(value) => updateParam('beta', value)}
          />
          <ParameterSlider
            label="速度"
            value={params.speed}
            min={1}
            max={10}
            step={1}
            onChange={(value) => updateParam('speed', value)}
          />
          <ParameterSlider
            label="縮放"
            value={params.scale}
            min={3}
            max={15}
            step={1}
            onChange={(value) => updateParam('scale', value)}
          />
          <ParameterSlider
            label="軌跡長度"
            value={params.trailLength}
            min={500}
            max={3000}
            step={100}
            onChange={(value) => updateParam('trailLength', value)}
          />
        </div>
      </div>

      {/* 操作按鈕 */}
      <ActionButtons
        isRunning={isRunning}
        onToggle={toggleAnimation}
        onReset={handleReset}
        onExport={handleExport}
      />

      {/* 系統信息 */}
      <SystemInfo
        title="洛倫茲系統"
        description="由三個耦合的微分方程組成，原本用於模擬大氣對流。微小的初始條件變化會導致截然不同的軌跡，這就是著名的「蝴蝶效應」。"
        equations={[
          'dx/dt = σ(y - x)',
          'dy/dt = x(ρ - z) - y',
          'dz/dt = xy - βz'
        ]}
        parameters={params}
        isChaotic={lorenzSystemRef.current?.isChaotic() ?? false}
      />
    </div>
  );
};

export default LorenzAttractor;
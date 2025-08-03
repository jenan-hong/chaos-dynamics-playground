// src/components/systems/DoublePendulum.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useCanvas } from '../../hooks/useCanvas';
import { useAnimation } from '../../hooks/useAnimation';
import { DoublePendulumSystem } from '@/systems/math/DoublePendulum';

const DoublePendulum: React.FC = () => {
  const { canvasRef, ctx, isReady, clearCanvas } = useCanvas();
  const { isRunning, fps, toggleAnimation, setAnimationCallback } = useAnimation();
  
  const [params, setParams] = useState({
    gravity: 1.0,
    damping: 0.999,
    length1: 100,
    length2: 100,
    mass1: 1,
    mass2: 1,
    trailLength: 500
  });

  const pendulumSystemRef = useRef<DoublePendulumSystem | null>(null);

  // 初始化系統
  useEffect(() => {
    pendulumSystemRef.current = new DoublePendulumSystem(params);
  }, []);

  // 更新參數
  useEffect(() => {
    if (pendulumSystemRef.current) {
      pendulumSystemRef.current.updateParams(params);
    }
  }, [params]);

  // 繪製函數
  const drawPendulum = useCallback(() => {
    if (!ctx || !isReady || !canvasRef.current || !pendulumSystemRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 3;

    // 計算新狀態
    pendulumSystemRef.current.step();

    // 獲取位置和軌跡
    const positions = pendulumSystemRef.current.getPendulumPositions();
    const trail = pendulumSystemRef.current.getTrail();

    // 清除畫布（輕微淡化效果）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);

    // 繪製軌跡
    if (trail.length > 1) {
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.7;
      
      ctx.beginPath();
      trail.forEach((point, index) => {
        const x = centerX + point.x;
        const y = centerY + point.y;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }

    // 繪製擺桿
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + positions.x1, centerY + positions.y1);
    ctx.lineTo(centerX + positions.x2, centerY + positions.y2);
    ctx.stroke();

    // 繪製支點
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
    ctx.fill();

    // 繪製第一個質量
    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(centerX + positions.x1, centerY + positions.y1, 10, 0, 2 * Math.PI);
    ctx.fill();

    // 繪製第二個質量
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(centerX + positions.x2, centerY + positions.y2, 10, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.shadowBlur = 0;
  }, [ctx, isReady, canvasRef]);

  // 設置動畫回調
  useEffect(() => {
    setAnimationCallback(drawPendulum);
  }, [drawPendulum, setAnimationCallback]);

  const updateParam = (key: keyof typeof params, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    if (pendulumSystemRef.current) {
      pendulumSystemRef.current.reset();
    }
    clearCanvas();
  };

  const handleExport = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `double-pendulum-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const handlePreset = (preset: string) => {
    switch (preset) {
      case 'classic':
        setParams(prev => ({ ...prev, gravity: 1.0, damping: 0.999, length1: 100, length2: 100 }));
        break;
      case 'asymmetric':
        setParams(prev => ({ ...prev, gravity: 1.0, damping: 0.999, length1: 80, length2: 120 }));
        break;
      case 'heavy':
        setParams(prev => ({ ...prev, gravity: 1.5, damping: 0.995, mass1: 2, mass2: 1 }));
        break;
    }
  };

  const currentState = pendulumSystemRef.current?.getState() ?? { theta1: 0, theta2: 0, omega1: 0, omega2: 0 };
  const totalEnergy = pendulumSystemRef.current?.getTotalEnergy() ?? 0;

  return (
    <div className="space-y-6">
      {/* 標題區域 */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-3 mb-4">
          <div className="text-4xl">⚖️</div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            混沌擺
          </h2>
        </div>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          觀察雙擺系統中微小初始條件差異如何導致完全不同的軌跡
        </p>
      </div>

      {/* Canvas區域 */}
      <div className="relative chaos-card p-6 glow-effect">
        <canvas 
          ref={canvasRef}
          className="w-full chaos-canvas bg-black"
          style={{ 
            height: '500px',
            minHeight: '500px'
          }}
        />
        
        {/* 狀態顯示 */}
        <div className="absolute top-6 left-6 status-display rounded-lg p-3 text-sm">
          <div className="flex items-center space-x-6">
            <div className="text-green-400">FPS: {fps}</div>
            <div className="text-blue-400">θ1: {(currentState.theta1 * 180 / Math.PI).toFixed(1)}°</div>
            <div className="text-red-400">θ2: {(currentState.theta2 * 180 / Math.PI).toFixed(1)}°</div>
            <div className="text-purple-400">能量: {totalEnergy.toFixed(2)}</div>
          </div>
        </div>

        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg backdrop-blur-sm">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-300">初始化混沌擺中...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* 控制面板 */}
      <div className="flex gap-6">
        {/* 系統參數控制 */}
        <div className="flex-1 chaos-card p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-semibold text-purple-400">系統參數</h3>
              <p className="text-gray-400 text-sm">調整雙擺的物理參數</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={toggleAnimation}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isRunning ? '⏸️ 停止' : '▶️ 開始'}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm font-medium transition-all"
              >
                🔄 重置
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-all"
              >
                💾 導出
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-2">
                重力: {params.gravity.toFixed(2)}
              </label>
              <input 
                type="range" 
                min="0.5" 
                max="2" 
                step="0.1" 
                value={params.gravity}
                onChange={(e) => updateParam('gravity', parseFloat(e.target.value))}
                className="w-full accent-purple-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-red-400 mb-2">
                阻尼: {params.damping.toFixed(3)}
              </label>
              <input 
                type="range" 
                min="0.99" 
                max="1" 
                step="0.001" 
                value={params.damping}
                onChange={(e) => updateParam('damping', parseFloat(e.target.value))}
                className="w-full accent-purple-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-400 mb-2">
                長度1: {params.length1}
              </label>
              <input 
                type="range" 
                min="50" 
                max="150" 
                step="5" 
                value={params.length1}
                onChange={(e) => updateParam('length1', parseInt(e.target.value))}
                className="w-full accent-purple-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">
                長度2: {params.length2}
              </label>
              <input 
                type="range" 
                min="50" 
                max="150" 
                step="5" 
                value={params.length2}
                onChange={(e) => updateParam('length2', parseInt(e.target.value))}
                className="w-full accent-purple-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-400 mb-2">
                質量1: {params.mass1.toFixed(1)}
              </label>
              <input 
                type="range" 
                min="0.5" 
                max="3" 
                step="0.1" 
                value={params.mass1}
                onChange={(e) => updateParam('mass1', parseFloat(e.target.value))}
                className="w-full accent-purple-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-2">
                軌跡長度: {params.trailLength}
              </label>
              <input 
                type="range" 
                min="100" 
                max="1000" 
                step="50" 
                value={params.trailLength}
                onChange={(e) => updateParam('trailLength', parseInt(e.target.value))}
                className="w-full accent-purple-500" 
              />
            </div>
          </div>

          {/* 預設按鈕 */}
          <div className="flex justify-center space-x-3 mt-6 pt-4 border-t border-white/10">
            <button
              onClick={() => handlePreset('classic')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
            >
              ⚖️ 經典雙擺
            </button>
            <button
              onClick={() => handlePreset('asymmetric')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors"
            >
              📐 不對稱擺
            </button>
            <button
              onClick={() => handlePreset('heavy')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
            >
              🏋️ 重質量擺
            </button>
          </div>
        </div>

        {/* 系統分析 */}
        <div className="flex-1 chaos-card p-6">
          <h3 className="text-xl font-semibold text-purple-400 mb-4">📊 系統分析</h3>
          <div className="space-y-4">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-cyan-400 mb-2">拉格朗日方程</h4>
              <div className="text-xs text-gray-300 space-y-1">
                <div>L = T - V (動能 - 位能)</div>
                <div>d/dt(∂L/∂θ̇) - ∂L/∂θ = 0</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-gray-800/30 p-3 rounded border-l-2 border-blue-500">
                <div className="text-sm font-semibold text-blue-400">第一個擺</div>
                <div className="text-xs text-gray-400">藍色質量 - 角度 θ1</div>
              </div>
              <div className="bg-gray-800/30 p-3 rounded border-l-2 border-red-500">
                <div className="text-sm font-semibold text-red-400">第二個擺</div>
                <div className="text-xs text-gray-400">紅色質量 - 角度 θ2</div>
              </div>
              <div className="bg-gray-800/30 p-3 rounded border-l-2 border-green-500">
                <div className="text-sm font-semibold text-green-400">軌跡</div>
                <div className="text-xs text-gray-400">第二個擺的運動路徑</div>
              </div>
            </div>

            <div className="bg-gray-800/30 p-3 rounded">
              <div className="text-sm text-gray-300 mb-2">
                <strong>混沌特性：</strong>
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <div>• 對初始條件極其敏感</div>
                <div>• 非週期性運動</div>
                <div>• 不可長期預測</div>
                <div>• 相空間中的奇異吸引子</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoublePendulum;
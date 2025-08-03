import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useCanvas } from '../../hooks/useCanvas';
import { useAnimation } from '../../hooks/useAnimation';
import { DoublePendulumSystem } from '@/systems/math/DoublePendulum';

const DoublePendulum: React.FC = () => {
  const { t } = useTranslation();
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
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {t('pendulumTitle')}
          </h2>
        </div>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          {t('pendulumSubtitle')}
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
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="text-cyan-400">θ₁: {currentState.theta1.toFixed(3)}°</div>
            <div className="text-blue-400">θ₂: {currentState.theta2.toFixed(3)}°</div>
            <div className="text-green-400">ω₁: {currentState.omega1.toFixed(3)}</div>
            <div className="text-yellow-400">ω₂: {currentState.omega2.toFixed(3)}</div>
            <div className="text-purple-400 col-span-2">{t('energy')}: {totalEnergy.toFixed(2)}</div>
          </div>
        </div>

        {/* FPS 顯示 */}
        <div className="absolute top-6 right-6 status-display rounded-lg p-2 text-sm">
          <div className="text-green-400">FPS: {fps}</div>
        </div>
      </div>

      {/* 控制面板 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 參數控制 */}
        <div className="chaos-card p-6">
          <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center">
            <span className="mr-2">🎛️</span>
            {t('parameters')}
          </h3>
          
          {/* 動作按鈕 */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={toggleAnimation}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isRunning 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {isRunning ? `⏸️ ${t('stop')}` : `▶️ ${t('start')}`}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm font-medium transition-all"
            >
              🔄 {t('reset')}
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-all"
            >
              💾 {t('export')}
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-2">
                {t('gravity')}: {params.gravity.toFixed(2)}
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
                {t('damping')}: {params.damping.toFixed(3)}
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
                {t('length1')}: {params.length1}
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
                {t('length2')}: {params.length2}
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
                {t('mass1')}: {params.mass1.toFixed(1)}
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
              <label className="block text-sm font-medium text-orange-400 mb-2">
                {t('mass2')}: {params.mass2.toFixed(1)}
              </label>
              <input 
                type="range" 
                min="0.5" 
                max="3" 
                step="0.1" 
                value={params.mass2}
                onChange={(e) => updateParam('mass2', parseFloat(e.target.value))}
                className="w-full accent-purple-500" 
              />
            </div>
          </div>

          {/* 預設選擇 */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-300 mb-3">{t('presets')}：</h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handlePreset('classic')}
                className="px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded text-sm font-medium transition-all"
              >
                {t('pendulumPresets.classic')}
              </button>
              <button
                onClick={() => handlePreset('asymmetric')}
                className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded text-sm font-medium transition-all"
              >
                {t('pendulumPresets.asymmetric')}
              </button>
              <button
                onClick={() => handlePreset('heavy')}
                className="px-3 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded text-sm font-medium transition-all"
              >
                {t('pendulumPresets.heavy')}
              </button>
            </div>
          </div>
        </div>

        {/* 資訊面板 */}
        <div className="chaos-card p-6">
          <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center">
            <span className="mr-2">📚</span>
            {t('pendulumName')}
          </h3>
          
          <div className="space-y-4">
            <div className="bg-gray-800/30 p-4 rounded border-l-4 border-cyan-500">
              <div className="text-center text-sm text-cyan-400 space-y-1">
                <div>{t('pendulumEquations')}</div>
                <div className="text-xs text-gray-300">{t('lagrangianMechanics')}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-gray-800/30 p-3 rounded border-l-2 border-cyan-500">
                <div className="text-sm font-semibold text-cyan-400">{t('pendulumMass1')}</div>
                <div className="text-xs text-gray-400">{t('firstPendulumBob')}</div>
              </div>
              <div className="bg-gray-800/30 p-3 rounded border-l-2 border-red-500">
                <div className="text-sm font-semibold text-red-400">{t('pendulumMass2')}</div>
                <div className="text-xs text-gray-400">{t('secondPendulumBob')}</div>
              </div>
              <div className="bg-gray-800/30 p-3 rounded border-l-2 border-green-500">
                <div className="text-sm font-semibold text-green-400">{t('trajectory')}</div>
                <div className="text-xs text-gray-400">{t('chaosTrail')}</div>
              </div>
            </div>

            <div className="bg-gray-800/30 p-3 rounded">
              <div className="text-sm text-gray-300 mb-2">
                <strong>{t('instructions')}：</strong>
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <div>• {t('adjustParametersRealtime')}</div>
                <div>• {t('observeChaosEvolution')}</div>
                <div>• {t('comparePresets')}</div>
                <div>• {t('watchEnergyConservation')}</div>
              </div>
            </div>

            <div className="bg-gray-800/30 p-3 rounded">
              <div className="text-sm text-gray-300 mb-2">
                <strong>{t('mathBackground')}：</strong>
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <div>• {t('doublePendulumDescription')}</div>
                <div>• {t('sensitiveInitialConditions')}</div>
                <div>• {t('conservativeSystem')}</div>
                <div>• {t('hamiltonianDynamics')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoublePendulum;
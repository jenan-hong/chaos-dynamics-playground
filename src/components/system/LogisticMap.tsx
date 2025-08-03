// src/components/systems/LogisticMap.tsx (正確實現)
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useCanvas } from '../../hooks/useCanvas';

const LogisticMap: React.FC = () => {
  const { t } = useTranslation();
  const { canvasRef, ctx, isReady } = useCanvas();
  
  const [params, setParams] = useState({
    rParam: 3.5,      // 當前r值
    x0: 0.5,          // 初始值
    rMax: 4.0,        // 顯示範圍最大值
    rMin: 2.5         // 顯示範圍最小值
  });

  const [showTimeSeries, setShowTimeSeries] = useState(false);
  const timeSeriesRef = useRef<number[]>([]);

  // 繪製分岔圖
  const drawBifurcationDiagram = useCallback(() => {
    if (!ctx || !isReady || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // 清除畫布
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    const { rParam, x0, rMax, rMin } = params;
    const iterations = 1000;
    const plotIterations = 100;

    // 繪製分岔圖
    ctx.fillStyle = '#4ade80';
    
    for (let i = 0; i < width; i++) {
      const r = rMin + (rMax - rMin) * i / width;
      let x = x0;
      
      // 讓系統穩定
      for (let j = 0; j < iterations; j++) {
        x = r * x * (1 - x);
      }
      
      // 繪製穩定後的點
      for (let j = 0; j < plotIterations; j++) {
        x = r * x * (1 - x);
        const pixelX = i;
        const pixelY = height - (x * height);
        
        ctx.fillRect(pixelX, pixelY, 1, 1);
      }
    }

    // 繪製當前r值的垂直線
    const currentR_X = ((rParam - rMin) / (rMax - rMin)) * width;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(currentR_X, 0);
    ctx.lineTo(currentR_X, height);
    ctx.stroke();

    // 繪製座標軸標籤
    ctx.fillStyle = '#999';
    ctx.font = '12px monospace';
    
    // X軸標籤
    ctx.textAlign = 'center';
    ctx.fillText(rMin.toString(), 50, height - 10);
    ctx.fillText(rMax.toString(), width - 50, height - 10);
    ctx.fillText('r', width / 2, height - 10);
    
    // Y軸標籤
    ctx.textAlign = 'right';
    ctx.fillText('1.0', 40, 20);
    ctx.fillText('0.5', 40, height / 2);
    ctx.fillText('0.0', 40, height - 20);
  }, [ctx, isReady, canvasRef, params]);

  // 繪製時間序列
  const drawTimeSeries = useCallback(() => {
    if (!ctx || !isReady || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // 計算時間序列
    let x = params.x0;
    const series: number[] = [];
    const iterations = 200;

    for (let i = 0; i < iterations; i++) {
      x = params.rParam * x * (1 - x);
      series.push(x);
    }

    timeSeriesRef.current = series;

    // 清除畫布
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    // 繪製時間序列
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();

    series.forEach((value, index) => {
      const x = (index / (series.length - 1)) * (width - 100) + 50;
      const y = height - 50 - (value * (height - 100));
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // 繪製點
    ctx.fillStyle = '#fbbf24';
    series.forEach((value, index) => {
      const x = (index / (series.length - 1)) * (width - 100) + 50;
      const y = height - 50 - (value * (height - 100));
      
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fill();
    });

    // 座標軸
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    
    // X軸
    ctx.beginPath();
    ctx.moveTo(50, height - 50);
    ctx.lineTo(width - 50, height - 50);
    ctx.stroke();
    
    // Y軸
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.lineTo(50, height - 50);
    ctx.stroke();

    // 標籤
    ctx.fillStyle = '#999';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(t('time'), width / 2, height - 10);
    ctx.textAlign = 'right';
    ctx.fillText('1.0', 40, 60);
    ctx.fillText('0.5', 40, height / 2);
    ctx.fillText('0.0', 40, height - 40);
  }, [ctx, isReady, canvasRef, params]);

  // 根據模式繪製
  useEffect(() => {
    if (showTimeSeries) {
      drawTimeSeries();
    } else {
      drawBifurcationDiagram();
    }
  }, [showTimeSeries, drawBifurcationDiagram, drawTimeSeries]);

  const updateParam = (key: keyof typeof params, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const handlePreset = (preset: string) => {
    switch (preset) {
      case 'stable':
        setParams(prev => ({ ...prev, rParam: 2.5, x0: 0.5 }));
        break;
      case 'period':
        setParams(prev => ({ ...prev, rParam: 3.2, x0: 0.5 }));
        break;
      case 'chaos':
        setParams(prev => ({ ...prev, rParam: 3.8, x0: 0.5 }));
        break;
    }
  };

  const getSystemState = () => {
    const r = params.rParam;
    if (r < 1) return t('extinct');
    if (r < 3) return t('stable');
    if (r < 1 + Math.sqrt(6)) return t('oscillating');
    if (r < 3.57) return t('periodic');
    return t('chaotic');
  };

  return (
    <div className="space-y-6">
      {/* 標題區域 */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-3 mb-4">
          <div className="text-4xl">📈</div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            {t('logisticTitle')}
          </h2>
        </div>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          {t('logisticSubtitle')}
        </p>
      </div>

      {/* Canvas區域 */}
      <div className="relative chaos-card p-6 glow-effect">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-purple-400">
            {showTimeSeries ? t('timeSeries') : t('bifurcationDiagram')}
          </h3>
          <button
            onClick={() => setShowTimeSeries(!showTimeSeries)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition-colors"
          >
            {showTimeSeries ? t('showBifurcation') : t('showTimeSeries')}
          </button>
        </div>

        <canvas 
          ref={canvasRef}
          className="w-full chaos-canvas bg-black"
          style={{ 
            height: '400px',
            minHeight: '400px'
          }}
        />
        
        {/* 狀態顯示 */}
        <div className="absolute top-16 left-6 status-display rounded-lg p-3 text-sm">
          <div className="flex items-center space-x-6">
            <div className="text-red-400">r: {params.rParam.toFixed(2)}</div>
            <div className="text-blue-400">x₀: {params.x0.toFixed(3)}</div>
            <div className="text-yellow-400">{t('systemStatus')}: {getSystemState()}</div>
            {showTimeSeries && timeSeriesRef.current.length > 0 && (
              <div className="text-green-400">
                {t('finalValue')}: {timeSeriesRef.current[timeSeriesRef.current.length - 1].toFixed(4)}
              </div>
            )}
          </div>
        </div>

        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg backdrop-blur-sm">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-300">{t('generatingLogistic')}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* 控制面板 */}
      <div className="flex gap-6">
        {/* 參數控制 */}
        <div className="flex-1 chaos-card p-6">
          <h3 className="text-xl font-semibold text-purple-400 mb-4">{t('parameterControl')}</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-red-400 mb-2">
                {t('rParameter')}: {params.rParam.toFixed(2)}
              </label>
              <input 
                type="range" 
                min="0.5" 
                max="4" 
                step="0.01" 
                value={params.rParam}
                onChange={(e) => updateParam('rParam', parseFloat(e.target.value))}
                className="w-full accent-purple-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-400 mb-2">
                {t('initialValue')} x₀: {params.x0.toFixed(3)}
              </label>
              <input 
                type="range" 
                min="0.001" 
                max="0.999" 
                step="0.001" 
                value={params.x0}
                onChange={(e) => updateParam('x0', parseFloat(e.target.value))}
                className="w-full accent-purple-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">
                {t('displayRangeMin')}: {params.rMin.toFixed(1)}
              </label>
              <input 
                type="range" 
                min="0.5" 
                max="2.5" 
                step="0.1" 
                value={params.rMin}
                onChange={(e) => updateParam('rMin', parseFloat(e.target.value))}
                className="w-full accent-purple-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-2">
                {t('displayRangeMax')}: {params.rMax.toFixed(1)}
              </label>
              <input 
                type="range" 
                min="3" 
                max="4" 
                step="0.1" 
                value={params.rMax}
                onChange={(e) => updateParam('rMax', parseFloat(e.target.value))}
                className="w-full accent-purple-500" 
              />
            </div>
          </div>

          {/* 預設按鈕 */}
          <div className="flex justify-center space-x-3 mt-6 pt-4 border-t border-white/10">
            <button
              onClick={() => handlePreset('stable')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors"
            >
              🟢 {t('logisticPresets.stable')}
            </button>
            <button
              onClick={() => handlePreset('period')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
            >
              🔵 {t('logisticPresets.period')}
            </button>
            <button
              onClick={() => handlePreset('chaos')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
            >
              🔴 {t('logisticPresets.chaos')}
            </button>
          </div>
        </div>

        {/* 系統分析 */}
        <div className="flex-1 chaos-card p-6">
          <h3 className="text-xl font-semibold text-purple-400 mb-4">📊 {t('systemAnalysis')}</h3>
          <div className="space-y-4">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-cyan-400 mb-2">{t('logisticEquation')}</h4>
              <div className="font-mono text-center text-lg text-green-400">
                x<sub>n+1</sub> = r × x<sub>n</sub> × (1 - x<sub>n</sub>)
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-gray-800/30 p-3 rounded border-l-2 border-green-500">
                <div className="text-sm font-semibold text-green-400">r &lt; 1: {t('extinct')}</div>
                <div className="text-xs text-gray-400">{t('populationExtinction')}</div>
              </div>
              <div className="bg-gray-800/30 p-3 rounded border-l-2 border-blue-500">
                <div className="text-sm font-semibold text-blue-400">1 &lt; r &lt; 3: {t('stable')}</div>
                <div className="text-xs text-gray-400">{t('stablePoint')}</div>
              </div>
              <div className="bg-gray-800/30 p-3 rounded border-l-2 border-yellow-500">
                <div className="text-sm font-semibold text-yellow-400">3 &lt; r &lt; 3.57: {t('periodic')}</div>
                <div className="text-xs text-gray-400">{t('periodicOscillation')}</div>
              </div>
              <div className="bg-gray-800/30 p-3 rounded border-l-2 border-red-500">
                <div className="text-sm font-semibold text-red-400">r &gt; 3.57: {t('chaotic')}</div>
                <div className="text-xs text-gray-400">{t('unpredictableBehavior')}</div>
              </div>
            </div>

            <div className="bg-gray-800/30 p-3 rounded">
              <div className="text-sm text-gray-300 mb-2">
                <strong>{t('bifurcationDescription')}</strong>
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <div>• {t('xAxisRValue')}</div>
                <div>• {t('yAxisBehavior')}</div>
                <div>• {t('redLineCurrentR')}</div>
                <div>• {t('greenDotsStableState')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogisticMap;
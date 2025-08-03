// src/components/systems/MandelbrotSet.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useCanvas } from '../../hooks/useCanvas';
import { MandelbrotSystem } from '@/systems/math/MandelbrotSystem';

const MandelbrotSet: React.FC = () => {
  const { t } = useTranslation();
  const { canvasRef, ctx, isReady } = useCanvas();
  
  const [params, setParams] = useState({
    maxIterations: 100,
    zoom: 1,
    centerX: -0.5,
    centerY: 0,
    colorIntensity: 1
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const mandelbrotSystemRef = useRef<MandelbrotSystem | null>(null);

  // 初始化系統
  useEffect(() => {
    mandelbrotSystemRef.current = new MandelbrotSystem(params);
  }, []);

  // 更新參數
  useEffect(() => {
    if (mandelbrotSystemRef.current) {
      mandelbrotSystemRef.current.updateParams(params);
    }
  }, [params]);

  // 生成曼德布洛特集合
  const generateMandelbrot = useCallback(() => {
    if (!ctx || !isReady || !canvasRef.current || !mandelbrotSystemRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    setIsGenerating(true);

    // 清除畫布
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    const system = mandelbrotSystemRef.current;
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    // 計算每個像素
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const c = system.screenToComplex(x, y, width, height);
        const result = system.calculatePoint(c);
        const color = system.iterationsToColor(result.iterations, result.escaped);

        const index = (y * width + x) * 4;
        data[index] = color.r;
        data[index + 1] = color.g;
        data[index + 2] = color.b;
        data[index + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    setIsGenerating(false);
  }, [ctx, isReady, canvasRef]);

  // 處理畫布點擊事件（縮放）
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || isGenerating) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 轉換為複數坐標
    const system = mandelbrotSystemRef.current;
    if (system) {
      const complex = system.screenToComplex(x, y, rect.width, rect.height);
      
      // 縮放並移動到點擊點
      setParams(prev => ({
        ...prev,
        centerX: complex.re,
        centerY: complex.im,
        zoom: prev.zoom * 2
      }));
    }
  }, [isGenerating]);

  const updateParam = (key: keyof typeof params, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `mandelbrot-set-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const handlePreset = (preset: string) => {
    switch (preset) {
      case 'classic':
        setParams({ maxIterations: 100, zoom: 1, centerX: -0.5, centerY: 0, colorIntensity: 1 });
        break;
      case 'seahorse':
        setParams({ maxIterations: 150, zoom: 50, centerX: -0.75, centerY: 0.1, colorIntensity: 2 });
        break;
      case 'spiral':
        setParams({ maxIterations: 200, zoom: 100, centerX: -0.235125, centerY: 0.827215, colorIntensity: 3 });
        break;
      case 'elephant':
        setParams({ maxIterations: 120, zoom: 20, centerX: 0.25, centerY: 0, colorIntensity: 1.5 });
        break;
    }
  };

  const handleReset = () => {
    setParams({ maxIterations: 100, zoom: 1, centerX: -0.5, centerY: 0, colorIntensity: 1 });
  };

  return (
    <div className="space-y-6">
      {/* 標題區域 */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-3 mb-4">
          <div className="text-4xl">🌀</div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            {t('mandelbrotTitle')}
          </h2>
        </div>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          {t('mandelbrotSubtitle')}
        </p>
      </div>

      {/* Canvas區域 */}
      <div className="relative chaos-card p-6 glow-effect">
        <canvas 
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full chaos-canvas bg-black cursor-crosshair"
          style={{ 
            height: '500px',
            minHeight: '500px'
          }}
        />
        
        {/* 狀態顯示 */}
        <div className="absolute top-6 left-6 status-display rounded-lg p-3 text-sm">
          <div className="flex items-center space-x-6">
            <div className="text-purple-400">{t('center')}: ({params.centerX.toFixed(6)}, {params.centerY.toFixed(6)})</div>
            <div className="text-blue-400">{t('zoom')}: {params.zoom.toFixed(2)}x</div>
            <div className="text-green-400">{t('maxIterations')}: {params.maxIterations}</div>
          </div>
        </div>

        {/* 點擊提示 */}
        <div className="absolute bottom-6 right-6 status-display rounded-lg p-3 text-xs">
          <div className="text-gray-300">{t('clickToZoomHint')}</div>
        </div>

        {/* 生成進度 */}
        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg backdrop-blur-sm">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-300">{t('generatingFractal')}</p>
            </div>
          </div>
        )}

        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg backdrop-blur-sm">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-300">{t('initializingCanvas')}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* 控制面板 */}
      <div className="flex gap-6">
        {/* 參數控制 */}
        <div className="flex-1 chaos-card p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-semibold text-purple-400">{t('fractalParameters')}</h3>
              <p className="text-gray-400 text-sm">{t('adjustMandelbrotParams')}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={generateMandelbrot}
                disabled={isGenerating}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isGenerating 
                    ? 'bg-gray-500 cursor-not-allowed' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                🎨 {t('generate')}
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
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-red-400 mb-2">
                {t('maxIterations')}: {params.maxIterations}
              </label>
              <input 
                type="range" 
                min="50" 
                max="500" 
                step="10" 
                value={params.maxIterations}
                onChange={(e) => updateParam('maxIterations', parseInt(e.target.value))}
                className="w-full accent-purple-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-400 mb-2">
                {t('zoom')}: {params.zoom.toFixed(2)}
              </label>
              <input 
                type="range" 
                min="0.1" 
                max="1000" 
                step="0.1" 
                value={params.zoom}
                onChange={(e) => updateParam('zoom', parseFloat(e.target.value))}
                className="w-full accent-purple-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">
                {t('centerX')}: {params.centerX.toFixed(4)}
              </label>
              <input 
                type="range" 
                min="-2" 
                max="1" 
                step="0.01" 
                value={params.centerX}
                onChange={(e) => updateParam('centerX', parseFloat(e.target.value))}
                className="w-full accent-purple-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-2">
                {t('centerY')}: {params.centerY.toFixed(4)}
              </label>
              <input 
                type="range" 
                min="-1.5" 
                max="1.5" 
                step="0.01" 
                value={params.centerY}
                onChange={(e) => updateParam('centerY', parseFloat(e.target.value))}
                className="w-full accent-purple-500" 
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-purple-400 mb-2">
                {t('colorIntensity')}: {params.colorIntensity.toFixed(1)}
              </label>
              <input 
                type="range" 
                min="0.5" 
                max="5" 
                step="0.1" 
                value={params.colorIntensity}
                onChange={(e) => updateParam('colorIntensity', parseFloat(e.target.value))}
                className="w-full accent-purple-500" 
              />
            </div>
          </div>

          {/* 預設按鈕 */}
          <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-white/10">
            <button
              onClick={() => handlePreset('classic')}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
            >
              🌀 {t('classicView')}
            </button>
            <button
              onClick={() => handlePreset('seahorse')}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors"
            >
              🌊 {t('seahorseTail')}
            </button>
            <button
              onClick={() => handlePreset('spiral')}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition-colors"
            >
              🌀 {t('spiralStructure')}
            </button>
            <button
              onClick={() => handlePreset('elephant')}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
            >
              🐘 {t('elephantValley')}
            </button>
          </div>
        </div>

        {/* 系統分析 */}
        <div className="flex-1 chaos-card p-6">
          <h3 className="text-xl font-semibold text-purple-400 mb-4">📊 {t('fractalMath')}</h3>
          <div className="space-y-4">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-cyan-400 mb-2">{t('iterationEquation')}</h4>
              <div className="font-mono text-center text-lg text-green-400 space-y-1">
                <div>z<sub>n+1</sub> = z<sub>n</sub>² + c</div>
                <div className="text-sm text-gray-300">z₀ = 0</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-gray-800/30 p-3 rounded border-l-2 border-black">
                <div className="text-sm font-semibold text-white">{t('blackRegion')}</div>
                <div className="text-xs text-gray-400">{t('mandelbrotBlackDesc')}</div>
              </div>
              <div className="bg-gray-800/30 p-3 rounded border-l-2 border-purple-500">
                <div className="text-sm font-semibold text-purple-400">{t('colorRegion')}</div>
                <div className="text-xs text-gray-400">{t('mandelbrotColorDesc')}</div>
              </div>
              <div className="bg-gray-800/30 p-3 rounded border-l-2 border-blue-500">
                <div className="text-sm font-semibold text-blue-400">{t('boundary')}</div>
                <div className="text-xs text-gray-400">{t('mandelbrotBoundaryDesc')}</div>
              </div>
            </div>

            <div className="bg-gray-800/30 p-3 rounded">
              <div className="text-sm text-gray-300 mb-2">
                <strong>{t('instructions')}：</strong>
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <div>• {t('clickToZoom')}</div>
                <div>• {t('increaseIterations')}</div>
                <div>• {t('usePresets')}</div>
                <div>• {t('colorIntensityEffect')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MandelbrotSet;
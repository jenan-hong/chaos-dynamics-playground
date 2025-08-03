// src/components/system/JuliaSet.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useCanvas } from '../../hooks/useCanvas';
import { JuliaSystem } from '@/systems/math/JuliaSet';

const JuliaSet: React.FC = () => {
  const { canvasRef, ctx, isReady } = useCanvas();
  
  const [params, setParams] = useState({
    cReal: -0.8,
    cImag: 0.156,
    maxIterations: 100,
    escapeRadius: 2,
    zoom: 1,
    centerX: 0,
    centerY: 0,
    colorIntensity: 1.5
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [setDescription, setSetDescription] = useState('');
  const juliaSystemRef = useRef<JuliaSystem | null>(null);

  // 初始化系統
  useEffect(() => {
    juliaSystemRef.current = new JuliaSystem(params);
    updateDescription();
  }, []);

  // 更新參數
  useEffect(() => {
    if (juliaSystemRef.current) {
      juliaSystemRef.current.updateParams(params);
      updateDescription();
    }
  }, [params]);

  // 更新集合描述
  const updateDescription = () => {
    if (juliaSystemRef.current) {
      setSetDescription(juliaSystemRef.current.getSetDescription());
    }
  };

  // 生成Julia集合
  const generateJulia = useCallback(async () => {
    if (!ctx || !isReady || !canvasRef.current || !juliaSystemRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    setIsGenerating(true);
    setProgress(0);

    // 清除畫布
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    const system = juliaSystemRef.current;
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    let pixelCount = 0;
    const totalPixels = width * height;

    // 逐行計算Julia集合
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const z0 = system.screenToComplex(x, y, width, height);
        const result = system.calculatePoint(z0);
        const color = system.iterationsToColor(result.iterations, result.escaped);

        const index = (y * width + x) * 4;
        data[index] = color.r;     // Red
        data[index + 1] = color.g; // Green
        data[index + 2] = color.b; // Blue
        data[index + 3] = 255;     // Alpha

        pixelCount++;
      }

      // 每10行更新一次進度
      if (y % 10 === 0) {
        const currentProgress = (pixelCount / totalPixels) * 100;
        setProgress(currentProgress);
        
        // 使用 setTimeout 讓UI有機會更新
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    // 繪製到畫布
    ctx.putImageData(imageData, 0, 0);
    setIsGenerating(false);
    setProgress(100);
  }, [ctx, isReady, canvasRef, params]);

  // 處理畫布點擊事件（縮放和平移）
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || isGenerating) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 轉換為複數坐標
    const system = juliaSystemRef.current;
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
    link.download = `julia-set-${params.cReal.toFixed(3)}-${params.cImag.toFixed(3)}-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const handlePreset = (preset: string) => {
    const presets = JuliaSystem.getPresets();
    if (presets[preset]) {
      setParams(prev => ({ ...prev, ...presets[preset] }));
    }
  };

  const handleReset = () => {
    setParams({
      cReal: -0.8,
      cImag: 0.156,
      maxIterations: 100,
      escapeRadius: 2,
      zoom: 1,
      centerX: 0,
      centerY: 0,
      colorIntensity: 1.5
    });
  };

  // 自動生成效果
  useEffect(() => {
    const timer = setTimeout(() => {
      generateJulia();
    }, 100);
    return () => clearTimeout(timer);
  }, [generateJulia]);

  return (
    <div className="space-y-6">
      {/* 標題區域 */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-3 mb-4">
          <div className="text-4xl">✨</div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Julia 集合
          </h2>
        </div>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          探索參數化的分形美學，每個參數c都創造出獨特的圖案
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
            <div className="text-pink-400">c = {params.cReal.toFixed(3)} + {params.cImag.toFixed(3)}i</div>
            <div className="text-purple-400">縮放: {params.zoom.toFixed(2)}x</div>
            <div className="text-blue-400">迭代: {params.maxIterations}</div>
          </div>
        </div>

        {/* 進度條 */}
        {isGenerating && (
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-gray-800/80 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-purple-400">生成中...</span>
                <span className="text-sm text-gray-300">{progress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 控制面板 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 參數控制 */}
        <div className="chaos-card p-6">
          <h3 className="text-xl font-bold text-pink-400 mb-4 flex items-center">
            <span className="mr-2">🎛️</span>
            參數控制
          </h3>
          
          {/* 動作按鈕 */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={generateJulia}
              disabled={isGenerating}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isGenerating 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              🔄 重新生成
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm font-medium transition-all"
            >
              🏠 重置
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-all"
            >
              💾 導出
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-pink-400 mb-2">
                實部 (c): {params.cReal.toFixed(3)}
              </label>
              <input 
                type="range" 
                min="-2" 
                max="2" 
                step="0.01" 
                value={params.cReal}
                onChange={(e) => updateParam('cReal', parseFloat(e.target.value))}
                className="w-full accent-pink-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-400 mb-2">
                虛部 (c): {params.cImag.toFixed(3)}
              </label>
              <input 
                type="range" 
                min="-2" 
                max="2" 
                step="0.01" 
                value={params.cImag}
                onChange={(e) => updateParam('cImag', parseFloat(e.target.value))}
                className="w-full accent-purple-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-400 mb-2">
                最大迭代: {params.maxIterations}
              </label>
              <input 
                type="range" 
                min="50" 
                max="300" 
                step="10" 
                value={params.maxIterations}
                onChange={(e) => updateParam('maxIterations', parseInt(e.target.value))}
                className="w-full accent-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-2">
                顏色強度: {params.colorIntensity.toFixed(1)}
              </label>
              <input 
                type="range" 
                min="0.5" 
                max="3" 
                step="0.1" 
                value={params.colorIntensity}
                onChange={(e) => updateParam('colorIntensity', parseFloat(e.target.value))}
                className="w-full accent-cyan-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">
                縮放: {params.zoom.toFixed(2)}x
              </label>
              <input 
                type="range" 
                min="0.1" 
                max="50" 
                step="0.1" 
                value={params.zoom}
                onChange={(e) => updateParam('zoom', parseFloat(e.target.value))}
                className="w-full accent-green-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-2">
                逃逸半徑: {params.escapeRadius}
              </label>
              <input 
                type="range" 
                min="2" 
                max="10" 
                step="0.5" 
                value={params.escapeRadius}
                onChange={(e) => updateParam('escapeRadius', parseFloat(e.target.value))}
                className="w-full accent-yellow-500" 
              />
            </div>
          </div>

          {/* 預設選擇 */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-300 mb-3">精選預設：</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handlePreset('dragon')}
                className="px-3 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded text-sm font-medium transition-all"
              >
                🐉 龍型
              </button>
              <button
                onClick={() => handlePreset('spiral')}
                className="px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded text-sm font-medium transition-all"
              >
                🌀 螺旋
              </button>
              <button
                onClick={() => handlePreset('dendrite')}
                className="px-3 py-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 rounded text-sm font-medium transition-all"
              >
                🌿 樹枝
              </button>
              <button
                onClick={() => handlePreset('lightning')}
                className="px-3 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 rounded text-sm font-medium transition-all"
              >
                ⚡ 閃電
              </button>
              <button
                onClick={() => handlePreset('classic')}
                className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded text-sm font-medium transition-all"
              >
                💜 經典
              </button>
              <button
                onClick={() => handlePreset('connected')}
                className="px-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded text-sm font-medium transition-all"
              >
                🔗 連通
              </button>
            </div>
          </div>
        </div>

        {/* 資訊面板 */}
        <div className="chaos-card p-6">
          <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center">
            <span className="mr-2">📚</span>
            Julia 集合
          </h3>
          
          <div className="space-y-4">
            <div className="bg-gray-800/30 p-4 rounded border-l-4 border-pink-500">
              <div className="text-center text-lg text-purple-400 space-y-1">
                <div>z<sub>n+1</sub> = z<sub>n</sub>² + c</div>
                <div className="text-sm text-gray-300">c = {params.cReal.toFixed(3)} + {params.cImag.toFixed(3)}i</div>
              </div>
            </div>
            
            <div className="bg-gray-800/30 p-3 rounded">
              <div className="text-sm font-semibold text-yellow-400 mb-2">當前集合類型：</div>
              <div className="text-xs text-gray-300">{setDescription}</div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="bg-gray-800/30 p-3 rounded border-l-2 border-black">
                <div className="text-sm font-semibold text-white">黑色區域</div>
                <div className="text-xs text-gray-400">屬於Julia集合（有界軌道）</div>
              </div>
              <div className="bg-gray-800/30 p-3 rounded border-l-2 border-pink-500">
                <div className="text-sm font-semibold text-pink-400">彩色區域</div>
                <div className="text-xs text-gray-400">發散軌道（逃逸到無窮）</div>
              </div>
              <div className="bg-gray-800/30 p-3 rounded border-l-2 border-purple-500">
                <div className="text-sm font-semibold text-purple-400">邊界</div>
                <div className="text-xs text-gray-400">混沌邊界的精細結構</div>
              </div>
            </div>

            <div className="bg-gray-800/30 p-3 rounded">
              <div className="text-sm text-gray-300 mb-2">
                <strong>操作說明：</strong>
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <div>• 調整c參數探索不同形狀</div>
                <div>• 點擊畫布進行縮放</div>
                <div>• 嘗試精選預設看有趣圖案</div>
                <div>• 增加迭代數獲得更多細節</div>
              </div>
            </div>

            <div className="bg-gray-800/30 p-3 rounded">
              <div className="text-sm text-gray-300 mb-2">
                <strong>數學背景：</strong>
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <div>• Julia集合由法國數學家Gaston Julia研究</div>
                <div>• 與Mandelbrot集合密切相關</div>
                <div>• 每個c值對應一個Julia集合</div>
                <div>• 展現了複動力系統的混沌美學</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JuliaSet;
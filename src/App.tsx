// src/App.tsx (恢復美觀header + 修復布局)

import { useState } from "react";
import LorenzAttractor from "./components/system/LorenzAttractor";
import MandelbrotSet from "./components/system/MandelbrotSet";
import LogisticMap from "./components/system/LogisticMap";
import DoublePendulum from "./components/system/DoublePendulum";

type SystemType = 'lorenz' | 'mandelbrot' | 'pendulum' | 'logistic' | 'julia';

const App: React.FC = () => {
  const [activeSystem, setActiveSystem] = useState<SystemType>('lorenz');

  const systems = [
    { 
      id: 'lorenz' as SystemType, 
      name: '洛倫茲吸引子', 
      description: '蝴蝶效應的數學化身',
      icon: '🦋'
    },
    { 
      id: 'mandelbrot' as SystemType, 
      name: '曼德布洛特集合', 
      description: '無限複雜的分形',
      icon: '🌀'
    },
    { 
      id: 'pendulum' as SystemType, 
      name: '混沌擺', 
      description: '雙擺的混沌運動',
      icon: '⚖️'
    },
    { 
      id: 'logistic' as SystemType, 
      name: '邏輯映射', 
      description: '從週期到混沌',
      icon: '📈'
    },
    { 
      id: 'julia' as SystemType, 
      name: 'Julia集合', 
      description: '美麗的分形圖案',
      icon: '✨'
    }
  ];

  const renderSystem = () => {
    switch (activeSystem) {
      case 'lorenz':
        return <LorenzAttractor />;
      case 'mandelbrot':
        return <MandelbrotSet />;
      case 'pendulum':
        return <DoublePendulum />;
      case 'logistic':
        return <LogisticMap />;
      case 'julia':
        return (
          <div className="chaos-card p-12 text-center slide-in">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-2xl font-bold text-purple-400 mb-2">Julia集合</h2>
            <p className="text-gray-400">敬請期待...</p>
          </div>
        );
      default:
        return <LorenzAttractor />;
    }
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      {/* 動態背景 */}
      <div className="fixed inset-0 chaos-bg-animation opacity-10"></div>
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900"></div>
      
      {/* 背景粒子效果 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-purple-500/20 rounded-full float-animation"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* 主內容 */}
      <div className="relative z-10">
        {/* 恢復美觀的Header */}
        <header className="glass-effect border-0 border-b border-white/10 slide-in">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-cyan-400 to-amber-400 bg-clip-text text-transparent">
                混沌理論互動探索器
              </h1>
              <p className="text-gray-300 text-lg md:text-xl mb-6 max-w-2xl mx-auto">
                探索確定性系統中的不可預測行為，體驗數學之美與混沌之奇
              </p>
              <div className="flex justify-center items-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span>React 18 + TypeScript</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                  <span>實時Canvas渲染</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                  <span>高性能計算</span>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          {/* Tab Navigation */}
          <nav className="flex justify-center mb-12 slide-in">
            <div className="glass-effect p-3 rounded-2xl">
              <div className="flex flex-wrap gap-3">
                {systems.map((system) => (
                  <button
                    key={system.id}
                    onClick={() => setActiveSystem(system.id)}
                    className={`
                      chaos-tab relative px-6 py-4 rounded-xl font-medium text-sm transition-all duration-300
                      ${activeSystem === system.id
                        ? 'active text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    <div className="relative z-10 flex flex-col items-center space-y-2">
                      <div className="text-2xl">{system.icon}</div>
                      <span className="font-semibold">{system.name}</span>
                      <span className="text-xs opacity-80">{system.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </nav>
          
          {/* 系統內容 */}
          <div className="slide-in">
            {renderSystem()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
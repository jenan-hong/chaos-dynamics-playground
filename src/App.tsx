import { useState } from "react";
import { useTranslation } from "react-i18next"; // 👈 新增
import LorenzAttractor from "./components/system/LorenzAttractor";
import MandelbrotSet from "./components/system/MandelbrotSet";
import LogisticMap from "./components/system/LogisticMap";
import DoublePendulum from "./components/system/DoublePendulum";
import JuliaSet from "./components/system/JuliaSet";
import LanguageSelector from "./components/common/LanguageSelector"; // 👈 新增

type SystemType = 'lorenz' | 'mandelbrot' | 'pendulum' | 'logistic' | 'julia';

const App: React.FC = () => {
  const { t } = useTranslation(); // 👈 新增
  const [activeSystem, setActiveSystem] = useState<SystemType>('lorenz');

  const systems = [
    { 
      id: 'lorenz' as SystemType, 
      name: t('lorenzName'), // 👈 修改
      description: t('lorenzDesc'), // 👈 修改
      icon: '🦋'
    },
    { 
      id: 'mandelbrot' as SystemType, 
      name: t('mandelbrotName'), // 👈 修改
      description: t('mandelbrotDesc'), // 👈 修改
      icon: '🌀'
    },
    { 
      id: 'pendulum' as SystemType, 
      name: t('pendulumName'), // 👈 修改
      description: t('pendulumDesc'), // 👈 修改
      icon: '⚖️'
    },
    { 
      id: 'logistic' as SystemType, 
      name: t('logisticName'), // 👈 修改
      description: t('logisticDesc'), // 👈 修改
      icon: '📈'
    },
    { 
      id: 'julia' as SystemType, 
      name: t('juliaName'), // 👈 修改
      description: t('juliaDesc'), // 👈 修改
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
        return <JuliaSet />;
      default:
        return <LorenzAttractor />;
    }
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      {/* 動態背景 - 保持不變 */}
      <div className="fixed inset-0 chaos-bg-animation opacity-10"></div>
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900"></div>
      
      {/* 背景粒子效果 - 保持不變 */}
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
        <header className="glass-effect border-0 border-b border-white/10 slide-in">
          <div className="container mx-auto px-4 py-8">
            {/* 👈 語言選擇器 - 新增 */}
            <div className="flex justify-end mb-4">
              <LanguageSelector />
            </div>
            
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-cyan-400 to-amber-400 bg-clip-text text-transparent">
                {t('appName')} {/* 👈 修改 */}
              </h1>
              <p className="text-gray-300 text-lg md:text-xl mb-6 max-w-2xl mx-auto">
                {t('subtitle')} {/* 👈 修改 */}
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
          
          <div className="slide-in">
            {renderSystem()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
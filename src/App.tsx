// src/App.tsx
import React, { useState } from "react";
import LorenzAttractor from "./components/system/LorenzAttractor";
import MandelbrotSet from "./components/system/MandelbrotSet";
import DoublePendulum from "./components/system/DoublePendulum";
import LogisticMap from "./components/system/LogisticMap";
import JuliaSet from "./components/system/JuliaSet";

// type SystemType 定義
type SystemType = "lorenz" | "mandelbrot" | "pendulum" | "logistic" | "julia";

const App: React.FC = () => {
  const [activeSystem, setActiveSystem] = useState<SystemType>("lorenz");

  const systems = [
    {
      id: "lorenz" as SystemType,
      name: "洛倫茲吸引子",
      description: "蝴蝶效應的數學化身",
    },
    {
      id: "mandelbrot" as SystemType,
      name: "曼德布洛特集合",
      description: "無限複雜的分形",
    },
    {
      id: "pendulum" as SystemType,
      name: "混沌擺",
      description: "雙擺的混沌運動",
    },
    {
      id: "logistic" as SystemType,
      name: "邏輯映射",
      description: "從週期到混沌",
    },
    {
      id: "julia" as SystemType,
      name: "Julia集合",
      description: "美麗的分形圖案",
    },
  ];

  const renderSystem = () => {
    switch (activeSystem) {
      case "lorenz":
        return <LorenzAttractor />;
      case "mandelbrot":
        return <MandelbrotSet />;
      case "pendulum":
        return <DoublePendulum />;
      case "logistic":
        return <LogisticMap />;
      case "julia":
        return <JuliaSet />;
      default:
        return <LorenzAttractor />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">
              混沌理論互動探索器
            </h1>
            <p className="text-gray-400 text-lg">
              探索確定性系統中的不可預測行為
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <nav className="flex justify-center mb-8">
          <div className="flex flex-wrap gap-2 p-2 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20">
            {systems.map((system) => (
              <button
                key={system.id}
                onClick={() => setActiveSystem(system.id)}
                className={`
                  group relative px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300
                  ${
                    activeSystem === system.id
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/30"
                      : "text-gray-300 hover:text-white hover:bg-purple-500/10"
                  }
                `}
              >
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-center leading-tight">
                    {system.name}
                  </span>
                  <span className="text-xs opacity-70">
                    {system.description}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </nav>

        {/* 系統內容 */}
        <div className="mt-8">{renderSystem()}</div>
      </main>
    </div>
  );
};

export default App;

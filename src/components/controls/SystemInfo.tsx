import React, { useState } from 'react';

interface SystemInfoProps {
  title: string;
  description: string;
  equations?: string[];
  parameters?: Record<string, number>;
  isChaotic?: boolean;
  keyFeatures?: string[];
}

const SystemInfo: React.FC<SystemInfoProps> = ({
  title,
  description,
  equations = [],
  parameters = {},
  isChaotic = false,
  keyFeatures = []
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-chaos-surface/50 backdrop-blur-sm border border-chaos-primary/20 rounded-lg">
      {/* 標題欄 */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isChaotic ? 'bg-red-400' : 'bg-green-400'}`} />
          <h3 className="text-lg font-semibold text-chaos-text">{title}</h3>
          {isChaotic && (
            <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-full">
              混沌狀態
            </span>
          )}
        </div>
        <svg 
          className={`w-5 h-5 text-chaos-text/60 transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* 詳細內容 */}
      <div className={`
        overflow-hidden transition-all duration-300 ease-in-out
        ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="px-4 pb-4 space-y-4">
          
          {/* 描述 */}
          <div>
            <h4 className="text-sm font-medium text-chaos-primary mb-2">系統描述</h4>
            <p className="text-sm text-chaos-text/70 leading-relaxed">
              {description}
            </p>
          </div>

          {/* 數學方程 */}
          {equations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-chaos-primary mb-2">控制方程</h4>
              <div className="space-y-1">
                {equations.map((equation, index) => (
                  <div key={index} className="font-mono text-sm text-chaos-accent bg-chaos-bg/50 px-3 py-2 rounded">
                    {equation}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 當前參數 */}
          {Object.keys(parameters).length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-chaos-primary mb-2">當前參數</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(parameters).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center bg-chaos-bg/30 px-3 py-2 rounded">
                    <span className="text-sm text-chaos-text/70">{key}:</span>
                    <span className="text-sm font-mono text-chaos-accent">
                      {typeof value === 'number' ? value.toFixed(2) : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 關鍵特徵 */}
          {keyFeatures.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-chaos-primary mb-2">關鍵特徵</h4>
              <ul className="space-y-1">
                {keyFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-chaos-text/70">
                    <span className="text-chaos-accent mt-1">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 混沌狀態說明 */}
          <div className="pt-3 border-t border-chaos-primary/20">
            <div className={`text-xs ${isChaotic ? 'text-red-400' : 'text-green-400'}`}>
              {isChaotic ? (
                <div className="flex items-center space-x-2">
                  <span>⚠</span>
                  <span>系統當前處於混沌狀態，對初始條件極其敏感</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>✓</span>
                  <span>系統當前處於穩定或週期狀態</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemInfo;
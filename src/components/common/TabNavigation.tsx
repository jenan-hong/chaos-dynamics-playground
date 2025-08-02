// src/components/common/TabNavigation.tsx
import React from 'react';
import { SystemType } from '../../types/systems';

interface SystemInfo {
  id: SystemType;
  name: string;
  description: string;
}

interface TabNavigationProps {
  systems: SystemInfo[];
  activeSystem: SystemType;
  onSystemChange: (system: SystemType) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  systems,
  activeSystem,
  onSystemChange
}) => {
  return (
    <nav className="flex justify-center mb-8">
      <div className="flex flex-wrap gap-2 p-2 bg-chaos-surface/50 backdrop-blur-sm rounded-2xl border border-chaos-primary/20">
        {systems.map((system) => (
          <button
            key={system.id}
            onClick={() => {
              console.log('Tab clicked:', system.id);
              onSystemChange(system.id);
            }}
            className={`
              group relative px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300
              ${activeSystem === system.id
                ? 'bg-gradient-to-r from-chaos-primary to-chaos-secondary text-white shadow-lg shadow-chaos-primary/30'
                : 'text-chaos-text/70 hover:text-chaos-text hover:bg-chaos-primary/10'
              }
            `}
          >
            <div className="flex flex-col items-center space-y-1">
              <span className="text-center leading-tight">
                {system.name}
              </span>
              <span className={`
                text-xs transition-opacity duration-300
                ${activeSystem === system.id 
                  ? 'opacity-90' 
                  : 'opacity-60 group-hover:opacity-80'
                }
              `}>
                {system.description}
              </span>
            </div>
            
            {/* 背景動畫效果 */}
            <div className={`
              absolute inset-0 rounded-xl transition-opacity duration-300
              bg-gradient-to-r from-chaos-primary/20 to-chaos-secondary/20
              ${activeSystem === system.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}
            `} />
          </button>
        ))}
      </div>
    </nav>
  );
};

export default TabNavigation;
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-chaos-surface/80 backdrop-blur-md border-b border-chaos-primary/20">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-chaos-primary via-chaos-accent to-chaos-secondary bg-clip-text text-transparent mb-2">
            混沌理論互動探索器
          </h1>
          <p className="text-chaos-text/70 text-lg">
            探索確定性系統中的不可預測行為
          </p>
          <div className="mt-4 flex justify-center items-center space-x-4 text-sm text-chaos-text/60">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              React 18 + TypeScript
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
              Pure Canvas Rendering
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
              Real-time Performance
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
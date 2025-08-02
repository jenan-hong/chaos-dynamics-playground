import React from 'react';

interface ActionButtonsProps {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  onExport: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isRunning,
  onToggle,
  onReset,
  onExport
}) => {
  return (
    <div className="flex justify-center items-center space-x-4">
      {/* 播放/暫停按鈕 */}
      <button
        onClick={onToggle}
        className={`
          flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300
          ${isRunning 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-green-500 hover:bg-green-600'
          }
          text-white shadow-lg hover:shadow-xl hover:scale-105
        `}
      >
        {isRunning ? (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
            <span>暫停</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <span>開始</span>
          </>
        )}
      </button>

      {/* 重置按鈕 */}
      <button
        onClick={onReset}
        className="
          flex items-center space-x-2 px-6 py-3 rounded-lg font-medium
          bg-gray-600 hover:bg-gray-700 text-white
          transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105
        "
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>重置</span>
      </button>

      {/* 導出按鈕 */}
      <button
        onClick={onExport}
        className="
          flex items-center space-x-2 px-6 py-3 rounded-lg font-medium
          bg-blue-600 hover:bg-blue-700 text-white
          transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105
        "
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>導出</span>
      </button>
    </div>
  );
};

export default ActionButtons;
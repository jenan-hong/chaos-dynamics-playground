import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '../../i18n';

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentLang = supportedLanguages.find(lang => lang.code === i18n.language) || supportedLanguages[0];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* 語言選擇按鈕 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-chaos-surface/50 hover:bg-chaos-surface border border-chaos-primary/20 hover:border-chaos-primary/50 rounded-lg transition-all duration-200 text-sm font-medium"
      >
        <span className="text-lg">{currentLang.flag}</span>
        <span className="hidden sm:inline text-chaos-text">{currentLang.name}</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉選單 */}
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* 選單內容 */}
          <div className="absolute top-full right-0 mt-2 w-48 bg-chaos-surface border border-chaos-primary/30 rounded-lg shadow-2xl z-50 overflow-hidden">
            <div className="py-2">
              {supportedLanguages.map((lang) => {
                const isActive = lang.code === currentLang.code;
                
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-chaos-primary/10 transition-colors duration-150 ${
                      isActive 
                        ? 'bg-chaos-primary/20 text-chaos-primary' 
                        : 'text-chaos-text hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <div className="flex-1">
                      <div className="font-medium">{lang.name}</div>
                      <div className="text-xs text-gray-400">{lang.code}</div>
                    </div>
                    {isActive && (
                      <svg className="w-4 h-4 text-chaos-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;
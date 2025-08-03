import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 導入語言文件
import zhTW from './zh-TW.json';
import zhCN from './zh-CN.json';
import en from './en.json';
import ja from './ja.json'; // 👈 新增

const resources = {
  'zh-TW': {
    translation: zhTW
  },
  'zh-CN': {
    translation: zhCN
  },
  'en': {
    translation: en
  },
  'ja': { // 👈 新增
    translation: ja
  }
};

// 支持的語言列表 - 導出供組件使用
export const supportedLanguages = [
  { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼' },
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' }, // 👈 新增
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh-TW',
    
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'chaos-language',
      caches: ['localStorage']
    },
    
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
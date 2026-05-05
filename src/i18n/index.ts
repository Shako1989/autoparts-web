import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import azCommon from './az/common.json';
import ruCommon from './ru/common.json';
import enCommon from './en/common.json';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'az',
    supportedLngs: ['az', 'ru', 'en'],
    defaultNS: 'common',
    ns: ['common'],
    resources: {
      az: { common: azCommon },
      ru: { common: ruCommon },
      en: { common: enCommon },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

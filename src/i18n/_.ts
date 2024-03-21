import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './en.json'

if (global?.localStorage?.i18debugger) {
  for (const key in en) {
    en[key] = `${en[key]} *`
  }
}

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    lng: global?.localStorage?.i18nextLng ?? 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    resources: {
      en: { translation: en },
    },
  })

export default i18n

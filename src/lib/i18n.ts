import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

import en from "@/locales/en.json"
import ru from "@/locales/ru.json"
import uz from "@/locales/uz.json"
import uzCyrillic from "@/locales/uz-cyrl.json"

export const languages = [
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
  { code: "uz", label: "O'zbekcha" },
  { code: "uz-Cyrl", label: "Ўзбекча" },
] as const

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      uz: { translation: uz },
      "uz-Cyrl": { translation: uzCyrillic },
    },
    fallbackLng: "uz",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  })

export { i18n }

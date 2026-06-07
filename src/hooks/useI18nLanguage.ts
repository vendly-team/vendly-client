import { useEffect, useState } from 'react'
import { i18n } from '@/lib/i18n'

export function useI18nLanguage() {
  const [language, setLanguage] = useState(i18n.language)

  useEffect(() => {
    const handler = (lng: string) => setLanguage(lng)
    i18n.on('languageChanged', handler)
    return () => { i18n.off('languageChanged', handler) }
  }, [])

  return language
}

// app/i18n/config.ts
// Configuration for next-intl

export const locales = ['es', 'en'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'es'

// Cookie name for storing user locale preference
export const LOCALE_COOKIE = 'NEXT_LOCALE'

// Labels for language switcher
export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
}

// Flags for visual display (optional)
export const localeFlags: Record<Locale, string> = {
  es: '🇪🇸',
  en: '🇬🇧',
}

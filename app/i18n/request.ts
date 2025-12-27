// app/i18n/request.ts
// next-intl request configuration for App Router

import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'
import { defaultLocale, locales, LOCALE_COOKIE, type Locale } from './config'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const headerStore = await headers()

  // 1. Try to get locale from cookie (user preference)
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value as Locale | undefined

  if (cookieLocale && locales.includes(cookieLocale)) {
    const messages = await loadMessages(cookieLocale)
    return { locale: cookieLocale, messages }
  }

  // 2. Try to detect from Vercel geolocation header (country-based)
  const country = headerStore.get('x-vercel-ip-country')
  const geoLocale = detectLocaleFromCountry(country)

  if (geoLocale) {
    const messages = await loadMessages(geoLocale)
    return { locale: geoLocale, messages }
  }

  // 3. Try to detect from Accept-Language header (browser preference)
  const acceptLanguage = headerStore.get('accept-language')
  const browserLocale = detectLocaleFromHeader(acceptLanguage)

  if (browserLocale) {
    const messages = await loadMessages(browserLocale)
    return { locale: browserLocale, messages }
  }

  // 4. Fall back to default locale
  const messages = await loadMessages(defaultLocale)
  return { locale: defaultLocale, messages }
})

/**
 * Detect locale from Vercel's x-vercel-ip-country header
 * Spanish-speaking countries → 'es', others → 'en'
 */
function detectLocaleFromCountry(country: string | null): Locale | null {
  if (!country) return null

  // Spanish-speaking countries (ISO 3166-1 alpha-2)
  const spanishCountries = [
    'ES', // Spain
    'MX', // Mexico
    'AR', // Argentina
    'CO', // Colombia
    'PE', // Peru
    'VE', // Venezuela
    'CL', // Chile
    'EC', // Ecuador
    'GT', // Guatemala
    'CU', // Cuba
    'BO', // Bolivia
    'DO', // Dominican Republic
    'HN', // Honduras
    'PY', // Paraguay
    'SV', // El Salvador
    'NI', // Nicaragua
    'CR', // Costa Rica
    'PA', // Panama
    'UY', // Uruguay
    'PR', // Puerto Rico
    'GQ', // Equatorial Guinea
  ]

  return spanishCountries.includes(country.toUpperCase()) ? 'es' : 'en'
}

/**
 * Detect locale from Accept-Language header
 */
function detectLocaleFromHeader(acceptLanguage: string | null): Locale | null {
  if (!acceptLanguage) return null

  // Parse Accept-Language header (e.g., "es-ES,es;q=0.9,en;q=0.8")
  const languages = acceptLanguage.split(',').map((lang) => {
    const [code] = lang.trim().split(';')
    return code.split('-')[0].toLowerCase() // Get base language code
  })

  // Find first matching locale
  for (const lang of languages) {
    if (locales.includes(lang as Locale)) {
      return lang as Locale
    }
  }

  return null
}

/**
 * Load messages for a locale (merging all module files)
 */
async function loadMessages(locale: Locale) {
  const modules = [
    'common',
    'dashboard',
    'parking',
    'logbooks',
    'logbook', // Singular namespace for LogbooksContainer hook messages
    'groups',
    'cashier',
    'maintenance',
    'blacklist',
    'backoffice',
    'messages',
    'profile',
    'conciliation',
    'auth',
    'errors',
    'validation',
    'restaurant',
    'booking',
    'notifications',
  ]

  const allMessages: Record<string, Record<string, unknown>> = {}

  for (const mod of modules) {
    try {
      const moduleMessages = (await import(`../../messages/${locale}/${mod}.json`)).default
      allMessages[mod] = moduleMessages
    } catch {
      // Module file doesn't exist yet, skip
      console.warn(`[i18n] Missing translation file: messages/${locale}/${mod}.json`)
    }
  }

  return allMessages
}

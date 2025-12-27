/**
 * Error translation utilities for i18n
 *
 * These utilities help translate backend error codes to user-friendly messages
 * based on the current locale.
 */

import { ApiError } from '@/app/lib/apiClient'

/**
 * Gets the translated error message from an error code
 *
 * @param t - The translation function from useTranslations('errors')
 * @param error - The error (can be ApiError, Error, or unknown)
 * @param fallbackMessage - Optional fallback message if translation is not found
 * @returns The translated error message
 *
 * @example
 * ```tsx
 * const t = useTranslations('errors')
 *
 * try {
 *   await someApiCall()
 * } catch (error) {
 *   const message = getErrorMessage(t, error)
 *   toast.error(message)
 * }
 * ```
 */
export function getErrorMessage(
  t: (key: string) => string,
  error: unknown,
  fallbackMessage?: string
): string {
  // If it's an ApiError with a code, try to translate it
  if (error instanceof ApiError && error.code) {
    try {
      const translated = t(`codes.${error.code}`)
      // next-intl returns the key if translation is not found
      if (translated !== `codes.${error.code}`) {
        return translated
      }
    } catch {
      // Translation not found, fall through to fallback
    }
  }

  // If it's an Error, return its message
  if (error instanceof Error) {
    return error.message
  }

  // Fallback
  return fallbackMessage || t('generic.message')
}

/**
 * Gets the translated success message from a success code
 *
 * @param t - The translation function from useTranslations('errors')
 * @param code - The success code from the backend
 * @param fallbackMessage - Optional fallback message if translation is not found
 * @returns The translated success message
 *
 * @example
 * ```tsx
 * const t = useTranslations('errors')
 *
 * const result = await someApiCall()
 * if (result.code) {
 *   const message = getSuccessMessage(t, result.code)
 *   toast.success(message)
 * }
 * ```
 */
export function getSuccessMessage(
  t: (key: string) => string,
  code: string,
  fallbackMessage?: string
): string {
  try {
    const translated = t(`success.${code}`)
    // next-intl returns the key if translation is not found
    if (translated !== `success.${code}`) {
      return translated
    }
  } catch {
    // Translation not found
  }

  return fallbackMessage || code
}

/**
 * Checks if an error has a translatable error code
 *
 * @param error - The error to check
 * @returns true if the error has a code property
 */
export function hasErrorCode(error: unknown): error is ApiError & { code: string } {
  return error instanceof ApiError && typeof error.code === 'string' && error.code.length > 0
}

/**
 * Gets the error code from an error if available
 *
 * @param error - The error to extract the code from
 * @returns The error code or undefined
 */
export function getErrorCode(error: unknown): string | undefined {
  if (error instanceof ApiError) {
    return error.code
  }
  return undefined
}

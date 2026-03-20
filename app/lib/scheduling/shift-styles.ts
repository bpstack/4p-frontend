// app/lib/scheduling/shift-styles.ts
// Centralized shift styling for light and dark modes
// Following the logbooks pattern: dark:bg-{color}-900/30 dark:text-{color}-400 dark:border-{color}-700

/**
 * Tailwind CSS classes for each shift code
 *
 * Pattern:
 * - Light: bg-{color}-100 border-{color}-300 text-{color}-800
 * - Dark: bg-{color}-900/30 border-{color}-700 text-{color}-400
 *
 * If you add a new shift to the database, add its styles here.
 */
export const SHIFT_STYLES: Record<string, string> = {
  // Work shifts
  M: 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-400',
  T: 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-400',
  N: 'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900/30 dark:border-orange-700 dark:text-orange-400',
  P: 'bg-indigo-100 border-indigo-300 text-indigo-800 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-400',
  PI: 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-400',

  // Non-work shifts (absences, days off)
  B: 'bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-400',
  V: 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400',
  L: 'bg-gray-100 border-gray-300 text-gray-600 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-400',
  FO: 'bg-lime-100 border-lime-300 text-lime-800 dark:bg-lime-900/30 dark:border-lime-700 dark:text-lime-400',
  IT: 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-400',
  E: 'bg-pink-100 border-pink-300 text-pink-800 dark:bg-pink-900/30 dark:border-pink-700 dark:text-pink-400',
  A: 'bg-rose-100 border-rose-300 text-rose-800 dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-400',
}

/** Default style for empty cells or unknown shift codes */
export const EMPTY_SHIFT_STYLE =
  'bg-gray-50 border-gray-200 text-gray-400 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-500'

/**
 * Get the CSS classes for a shift code
 * @param shiftCode - The shift code (M, T, N, etc.) or null for empty
 * @returns Tailwind CSS classes string
 */
export function getShiftClasses(shiftCode: string | null): string {
  if (!shiftCode) return EMPTY_SHIFT_STYLE
  return SHIFT_STYLES[shiftCode] || EMPTY_SHIFT_STYLE
}

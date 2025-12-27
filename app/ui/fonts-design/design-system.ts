// app/ui/fonts-design/design-system.ts

/**
 * Sistema de diseño centralizado
 *
 * Este archivo define todos los estilos de tipografía de la aplicación.
 * Para cambiar las fuentes, modifica fonts.helper.ts y las clases se actualizan automáticamente.
 */

// ============= CONFIGURACIÓN DE FUENTES =============
// ✅ ACTUALIZADO: Ahora coincide con tailwind.config.ts
const FONT_CONFIG = {
  primary: 'font-sans', // Mapea a tu 'primary' de fonts.helper.ts
  display: 'font-display', // Mapea a tu 'display' de fonts.helper.ts
} as const

// ============= SISTEMA DE TIPOGRAFÍA =============

export const typography = {
  // ============= FAMILIAS =============
  family: {
    primary: FONT_CONFIG.primary,
    display: FONT_CONFIG.display,
  },

  // ============= TAMAÑOS =============
  // Escala modular optimizada
  size: {
    // Textos pequeños
    xs: 'text-xs', // 12px - Metadatos, badges, footers
    sm: 'text-sm', // 14px - Texto secundario, labels, captions

    // Textos principales
    base: 'text-base', // 16px - Texto principal (DEFAULT)
    lg: 'text-lg', // 18px - Texto destacado, leads

    // Encabezados
    xl: 'text-xl', // 20px - H4
    '2xl': 'text-2xl', // 24px - H3
    '3xl': 'text-3xl', // 30px - H2
    '4xl': 'text-4xl', // 36px - H1

    // Especiales (usar con moderación)
    '5xl': 'text-5xl', // 48px - Hero sections
    '6xl': 'text-6xl', // 60px - Landing pages destacadas
  },

  // ============= PESOS =============
  weight: {
    normal: 'font-normal', // 400 - Texto normal
    medium: 'font-medium', // 500 - Énfasis suave
    semibold: 'font-semibold', // 600 - Subtítulos, labels importantes
    bold: 'font-bold', // 700 - Títulos, CTAs, énfasis fuerte
  },

  // ============= ALTURAS DE LÍNEA =============
  leading: {
    tight: 'leading-tight', // 1.25 - Títulos grandes
    snug: 'leading-snug', // 1.375 - Subtítulos
    normal: 'leading-normal', // 1.5 - Texto general
    relaxed: 'leading-relaxed', // 1.625 - Párrafos largos
    loose: 'leading-loose', // 2 - Texto aireado
  },

  // ============= PRESETS PREDEFINIDOS =============
  // Combinaciones listas para usar
  preset: {
    // Encabezados
    h1: `${FONT_CONFIG.display} text-4xl font-bold leading-tight`,
    h2: `${FONT_CONFIG.display} text-3xl font-bold leading-tight`,
    h3: `${FONT_CONFIG.display} text-2xl font-semibold leading-snug`,
    h4: `${FONT_CONFIG.primary} text-xl font-semibold leading-snug`,
    h5: `${FONT_CONFIG.primary} text-lg font-semibold leading-normal`,
    h6: `${FONT_CONFIG.primary} text-base font-semibold leading-normal`,

    // Textos
    body: `${FONT_CONFIG.primary} text-base font-normal leading-normal`,
    bodyLarge: `${FONT_CONFIG.primary} text-lg font-normal leading-relaxed`,
    lead: `${FONT_CONFIG.primary} text-lg font-normal leading-relaxed`,
    small: `${FONT_CONFIG.primary} text-sm font-normal leading-normal`,
    caption: `${FONT_CONFIG.primary} text-xs font-normal leading-normal`,

    // Componentes específicos
    button: `${FONT_CONFIG.primary} text-sm font-semibold leading-none`,
    buttonLarge: `${FONT_CONFIG.primary} text-base font-semibold leading-none`,
    label: `${FONT_CONFIG.primary} text-sm font-medium leading-none`,
    input: `${FONT_CONFIG.primary} text-base font-normal leading-normal`,
    badge: `${FONT_CONFIG.primary} text-xs font-medium leading-none`,

    // Hero sections
    hero: `${FONT_CONFIG.display} text-5xl md:text-6xl font-bold leading-tight`,
    heroSubtitle: `${FONT_CONFIG.primary} text-lg md:text-xl font-normal leading-relaxed`,
  },
} as const

// ============= UTILIDADES =============

/**
 * Combina múltiples clases de CSS de forma segura
 * Filtra valores falsy automáticamente
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Helper para crear variantes de texto personalizadas
 *
 * @example
 * const customText = textVariant('primary', 'lg', 'bold')
 * // Resultado: 'font-sans text-lg font-bold'
 */
export function textVariant(
  family: keyof typeof typography.family,
  size: keyof typeof typography.size,
  weight: keyof typeof typography.weight = 'normal',
  leading: keyof typeof typography.leading = 'normal'
): string {
  return cn(
    typography.family[family],
    typography.size[size],
    typography.weight[weight],
    typography.leading[leading]
  )
}

// ============= EXPORTS =============

// Exportar configuración para uso en otros archivos
export { FONT_CONFIG }

// Type helpers para TypeScript
export type TypographyPreset = keyof typeof typography.preset
export type FontFamily = keyof typeof typography.family
export type FontSize = keyof typeof typography.size
export type FontWeight = keyof typeof typography.weight
export type LineHeight = keyof typeof typography.leading

// app/ui/fonts-design/fonts.ts

import { Poppins } from 'next/font/google'

// ============= FUENTES ACTIVAS (Google Fonts) =============
// Solo importa las fuentes que realmente usas para evitar precargas innecesarias

export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

// ============= FUENTES DEL SISTEMA =============
// Fuentes nativas del sistema operativo (sin cargar desde Google Fonts)

// Ubuntu (Linux)
export const ubuntu = {
  variable: '--font-ubuntu',
  className: 'font-ubuntu',
  style: { fontFamily: 'Ubuntu, -apple-system, "Segoe UI", sans-serif' },
}

// Fuente del sistema de Apple
export const appleSystem = {
  variable: '--font-apple-system',
  className: 'font-apple-system',
  style: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
}

// Arial (disponible en todos los sistemas)
export const arial = {
  variable: '--font-arial',
  className: 'font-arial',
  style: { fontFamily: 'Arial, Helvetica, sans-serif' },
}

// Segoe UI (Windows)
export const segoeUI = {
  variable: '--font-segoe',
  className: 'font-segoe',
  style: { fontFamily: '"Segoe UI", -apple-system, Arial, sans-serif' },
}

// System UI genérica
export const systemUI = {
  variable: '--font-system',
  className: 'font-system',
  style: {
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Ubuntu, Roboto, sans-serif',
  },
}

// Fuentes para emojis
export const emojiFont = {
  variable: '--font-emoji',
  className: 'font-emoji',
  style: { fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif' },
}

// ============= GOOGLE FONTS OPCIONALES =============
// IMPORTANTE: Cada fuente añade ~20-50kb de descarga
//
// CÓMO ACTIVAR UNA FUENTE:
// 1. Descomenta el import y export de la fuente que quieras (ej: Montserrat)
// 2. Ve a fonts.helper.ts y añádela al import:
//    import { poppins, ubuntu, montserrat } from './fonts'
// 3. Úsala en ACTIVE_FONTS:
//    export const ACTIVE_FONTS = {
//      primary: poppins,
//      display: montserrat,  // <-- aquí
//    }
// 4. Reinicia el servidor de desarrollo

// import { Source_Sans_3 } from 'next/font/google'
// export const sourceSansPro = Source_Sans_3({
//   subsets: ['latin'],
//   variable: '--font-source-sans',
//   display: 'swap',
// })

// import { Montserrat } from 'next/font/google'
// export const montserrat = Montserrat({
//   subsets: ['latin'],
//   variable: '--font-montserrat',
//   display: 'swap',
// })

// import { Inter } from 'next/font/google'
// export const inter = Inter({
//   subsets: ['latin'],
//   variable: '--font-inter',
//   display: 'swap',
// })

// import { Roboto } from 'next/font/google'
// export const roboto = Roboto({
//   subsets: ['latin'],
//   weight: ['400', '500', '700'],
//   variable: '--font-roboto',
//   display: 'swap',
// })

// import { Open_Sans } from 'next/font/google'
// export const openSans = Open_Sans({
//   subsets: ['latin'],
//   variable: '--font-open-sans',
//   display: 'swap',
// })

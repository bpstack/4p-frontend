// // app/components/SetThemeButton.tsx
// 'use client'
// import { useState, useEffect } from 'react'

// const SetThemeButton = () => {
//   const [theme, setTheme] = useState(global.window?.__theme || 'light')

//   const isDark = theme === 'dark'

//   const toggleTheme = () => {
//     global.window?.__setPreferredTheme(isDark ? 'light' : 'dark')
//   }

//   useEffect(() => {
//     global.window.__onThemeChange = setTheme
//   }, [])

//   return (
//     <button style={{ width: '10ch', height: 'auto' }} onClick={toggleTheme}>
//       {isDark ? 'dark' : 'light'}
//     </button>
//   )
// }

// app/components/theme/SetThemeButton.tsx
'use client'

import { FiMoon, FiSun } from 'react-icons/fi'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import styles from '@/app/ui/home.module.css'

const SetThemeButton = () => {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Evitar hidratación hasta que el componente esté montado en el cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`${styles['shape-container']} hidden md:flex`}>
        <div className={styles.shape}></div>
        <div className="w-5 h-5"></div>
      </div>
    )
  }

  const isDark = resolvedTheme === 'dark'

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <div onClick={toggleTheme} className={`${styles['shape-container']} hidden md:flex`}>
      <div className={styles.shape}></div>
      {isDark ? (
        <FiSun className={`${styles['shape-icon']} text-orange-500 w-5 h-5`} />
      ) : (
        <FiMoon className={`${styles['shape-icon']} text-blue-400 w-5 h-5`} />
      )}
    </div>
  )
}

export default SetThemeButton

export const SimpleThemeButton = () => {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="flex items-center justify-center w-7 h-7 md:w-10 md:h-10 p-1 md:p-2">
        <div className="w-4 h-4 md:w-5 md:h-5"></div>
      </button>
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex items-center justify-center w-7 h-7 md:w-10 md:h-10 text-gray-600 dark:text-yellow-400 p-1 md:p-2 transition-transform duration-300 hover:scale-110"
    >
      {isDark ? (
        <FiSun className="w-4 h-4 md:w-5 md:h-5" />
      ) : (
        <FiMoon className="w-4 h-4 md:w-5 md:h-5" />
      )}
    </button>
  )
}

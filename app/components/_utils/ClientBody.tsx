// app/components/ClientBody.tsx

// Componente en caso de que tenga errores de "hydration mismatch" en consola al renderizar el cliente.

'use client'

import { useState, useEffect } from 'react'

interface ClientBodyProps {
  children: React.ReactNode
  montserratVariable: string
  interVariable: string
}

export default function ClientBody({
  children,
  montserratVariable,
  interVariable,
}: ClientBodyProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // ✅ Cleanup de atributos de extensiones que causan hydration errors
    document.body.removeAttribute('cz-shortcut-listen')
  }, [])

  // ✅ Durante SSR: render sin clases para evitar mismatch
  if (!isClient) {
    return (
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    )
  }

  // ✅ En el cliente: aplicar las clases CSS correctamente
  return (
    <body className={`${montserratVariable} ${interVariable} antialiased`} suppressHydrationWarning>
      {children}
    </body>
  )
}

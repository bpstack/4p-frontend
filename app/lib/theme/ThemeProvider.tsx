// app/lib/theme/ThemeProvider.tsx
'use client'

import { PropsWithChildren, FC, useState } from 'react'
import { NextUIProvider } from '@nextui-org/react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from '../auth/useAuth'
import { Toaster } from 'react-hot-toast'

const Providers: FC<PropsWithChildren> = ({ children }) => {
  // ✅ NUEVO: Crear QueryClient para React Query
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // 30 segundos
            gcTime: 5 * 60 * 1000, // 5 minutos (cache time)
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  )

  return (
    <NextUIProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={false}
      >
        {/* ✅ NUEVO: Envolver con QueryClientProvider */}
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {children}

            {/* Toaster existente */}
            <Toaster
              position="top-center"
              gutter={16}
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1F2937',
                  color: '#F9FAFB',
                  fontSize: '14px',
                  borderRadius: '8px',
                  border: '1px solid #374151',
                  padding: '12px 16px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                },
              }}
            />

            {/* ✅ NUEVO: React Query Devtools (solo desarrollo) */}
            {process.env.NODE_ENV === 'development' && (
              <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
            )}
          </AuthProvider>
        </QueryClientProvider>
      </NextThemesProvider>
    </NextUIProvider>
  )
}

export default Providers

//app/login/page.tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AtSymbolIcon, KeyIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { ArrowRightIcon } from '@heroicons/react/20/solid'
import { Fa4 } from 'react-icons/fa6'
import { TbTransformPointTopLeft } from 'react-icons/tb'
import { SimpleThemeButton } from '@/app/components/theme/SetThemeButton'
import { useAuth } from '@/app/lib/auth/useAuth'
import Link from 'next/link'

export default function LoginPage() {
  const t = useTranslations('auth')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)
  const { login, loading } = useAuth()
  // Validación en tiempo real
  const validateUsername = (value: string) => {
    if (value.length === 0) return
    if (value.length < 3) {
      setFieldErrors((prev) => ({
        ...prev,
        username: t('errors.usernameMinLength'),
      }))
    } else {
      setFieldErrors((prev) => ({ ...prev, username: '' }))
    }
  }

  const validatePassword = (value: string) => {
    if (value.length === 0) return
    if (value.length < 6) {
      setFieldErrors((prev) => ({
        ...prev,
        password: t('errors.passwordMinLength'),
      }))
    } else {
      setFieldErrors((prev) => ({ ...prev, password: '' }))
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setSuccess(false)

    try {
      await login(username, password)
    } catch (err: unknown) {
      const error = err as { errors?: Record<string, string>; message?: string }
      if (error.errors && typeof error.errors === 'object') {
        setFieldErrors(error.errors)
      } else {
        setError(error.message || t('errors.invalidCredentials'))
      }
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black px-6">
      <div className="flex flex-col items-center w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex h-20 w-full items-center justify-center rounded-lg bg-blue-500 dark:bg-black p-4 md:h-42">
          <div className="absolute right-8 top-8 md:hidden">
            <SimpleThemeButton />
          </div>
          <div className="relative flex items-center justify-center gap-6">
            <div className="flex gap-1">
              <Link
                href="/"
                className="text-white text-5xl drop-shadow-lg hover:scale-125 transition-transform duration-300 cursor-pointer"
              >
                <Fa4 />
              </Link>
              <Link
                href="/"
                className="text-white text-5xl drop-shadow-lg hover:rotate-12 hover:scale-125 transition-transform duration-300 cursor-pointer"
              >
                <TbTransformPointTopLeft />
              </Link>
            </div>
          </div>
        </div>

        {/* Formulario de Login */}
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0d1117] px-6 pb-6 pt-8 shadow-lg border border-gray-200 dark:border-neutral-800"
        >
          <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {t('login.titleFourPoints')}
          </h1>

          {/* Mensaje de éxito */}
          {success && (
            <div className="mb-4 flex items-center gap-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
              <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  {t('login.loginSuccess')}
                </p>
                <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                  {t('login.redirecting')}
                </p>
              </div>
            </div>
          )}

          {/* Error general */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-xs font-medium text-gray-700 dark:text-[#c9d1d9]"
            >
              {t('login.username')}
            </label>
            <div className="relative">
              <input
                id="username"
                type="text"
                placeholder={t('login.usernamePlaceholder')}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  if (fieldErrors.username) {
                    setFieldErrors({ ...fieldErrors, username: '' })
                  }
                }}
                onBlur={(e) => validateUsername(e.target.value)}
                required
                minLength={3}
                className={`peer block w-full rounded-md border ${
                  fieldErrors.username
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-[#30363d]'
                } bg-white dark:bg-[#0d1117] py-2 pl-10 text-sm 
                  text-black dark:text-[#f0f6fc] 
                  placeholder-gray-500 dark:placeholder-[#8b949e] 
                  focus:outline-none focus:ring-2 ${
                    fieldErrors.username
                      ? 'focus:ring-red-500'
                      : 'focus:ring-blue-500 dark:focus:ring-[#1f6feb]'
                  }`}
              />
              <AtSymbolIcon
                className={`pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 ${
                  fieldErrors.username
                    ? 'text-red-500'
                    : 'text-gray-500 dark:text-[#8b949e] peer-focus:text-gray-900 dark:peer-focus:text-[#f0f6fc]'
                }`}
              />
            </div>
            {fieldErrors.username && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.username}</p>
            )}
          </div>

          {/* Password */}
          <div className="mt-4">
            <label
              htmlFor="password"
              className="mb-2 block text-xs font-medium text-gray-700 dark:text-[#c9d1d9]"
            >
              {t('login.password')}
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                placeholder={t('login.passwordMinHint')}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (fieldErrors.password) {
                    setFieldErrors({ ...fieldErrors, password: '' })
                  }
                }}
                onBlur={(e) => validatePassword(e.target.value)}
                required
                minLength={6}
                className={`peer block w-full rounded-md border ${
                  fieldErrors.password
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-[#30363d]'
                } bg-white dark:bg-[#0d1117] py-2 pl-10 text-sm 
                  text-black dark:text-[#f0f6fc] 
                  placeholder-gray-500 dark:placeholder-[#8b949e] 
                  focus:outline-none focus:ring-2 ${
                    fieldErrors.password
                      ? 'focus:ring-red-500'
                      : 'focus:ring-blue-500 dark:focus:ring-[#1f6feb]'
                  }`}
              />
              <KeyIcon
                className={`pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 ${
                  fieldErrors.password
                    ? 'text-red-500'
                    : 'text-gray-500 dark:text-[#8b949e] peer-focus:text-gray-900 dark:peer-focus:text-[#f0f6fc]'
                }`}
              />
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.password}</p>
            )}
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={loading || success}
            className="mt-6 flex w-full items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('login.submitting') : success ? t('login.success') : t('login.submit')}
            {!loading && !success && <ArrowRightIcon className="ml-2 h-5 w-5" />}
          </button>

          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('login.noAccount')}{' '}
            <Link
              href="https://www.stackbp.es/"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t('login.liveDemo')}
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}

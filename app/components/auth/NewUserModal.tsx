// components/auth/NewUserModal.tsx

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { FiUser, FiAlertCircle, FiUserPlus } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import {
  SlidePanel,
  SlidePanelFooterButtons,
  FormField,
  Alert,
  inputClassName,
  selectClassName,
} from '@/app/ui/panels'

interface NewUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function NewUserModal({ isOpen, onClose, onSuccess }: NewUserModalProps) {
  const t = useTranslations('auth')
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'recepcionista',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('errors.errorCreating'))
      }

      // Success
      toast.success(t('newUser.success'))
      setFormData({ username: '', email: '', password: '', role: 'recepcionista' })
      onSuccess()
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : t('errors.errorCreating')
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const isFormValid =
    formData.username.trim() &&
    formData.email.trim() &&
    formData.password.trim() &&
    formData.password.length >= 6

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={t('newUser.title')}
      subtitle={t('newUser.subtitle')}
      size="lg"
      position="right"
      headerIcon={<FiUser className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
      footer={
        <SlidePanelFooterButtons
          onCancel={onClose}
          onSubmit={handleSubmit}
          cancelText={t('newUser.cancel')}
          submitText={loading ? t('newUser.creating') : t('newUser.createAccount')}
          submitIcon={<FiUserPlus className="w-4 h-4" />}
          isSubmitting={loading}
          submitDisabled={!isFormValid}
          submitVariant="success"
        />
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!loading && isFormValid) void handleSubmit()
        }}
        className="space-y-5"
      >
        {/* Error Message */}
        {error && (
          <Alert variant="error">
            <div className="flex items-start gap-2">
              <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </Alert>
        )}

        {/* Username */}
        <FormField label={t('newUser.username')} required>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder={t('newUser.usernamePlaceholder')}
            required
            className={inputClassName}
            disabled={loading}
          />
        </FormField>

        {/* Email */}
        <FormField label={t('newUser.email')} required>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t('newUser.emailPlaceholder')}
            required
            className={inputClassName}
            disabled={loading}
          />
        </FormField>

        {/* Password */}
        <FormField label={t('newUser.password')} required hint={t('newUser.passwordHint')}>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={t('newUser.passwordPlaceholder')}
            required
            minLength={6}
            className={inputClassName}
            disabled={loading}
          />
        </FormField>

        {/* Role */}
        <FormField label={t('newUser.role')} required>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className={selectClassName}
            disabled={loading}
          >
            <option value="recepcionista">{t('newUser.roles.receptionist')}</option>
            <option value="admin">{t('newUser.roles.admin')}</option>
            <option value="group-admin">{t('newUser.roles.groupAdmin')}</option>
            <option value="mantenimiento">{t('newUser.roles.maintenance')}</option>
          </select>
        </FormField>
      </form>
    </SlidePanel>
  )
}

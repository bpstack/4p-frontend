// app/components/dashboard/ContextualHelpCard.tsx
'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi'

interface ContextualHelpCardProps {
  selectedPeriod: 'today' | 'week' | 'month'
  hasEntries: boolean
}

export function ContextualHelpCard({ selectedPeriod, hasEntries }: ContextualHelpCardProps) {
  const t = useTranslations('dashboard.contextualHelp')

  const periodLabel = t(`periodLabels.${selectedPeriod}`)
  const periodText = t(`periodText.${selectedPeriod}`)

  return (
    <div className="bg-gradient-to-br from-[#ddf4ff] to-[#b6e3ff] dark:from-[#051d30] dark:to-[#0a2540] border border-[#9cd7ff] dark:border-[#1f6feb] rounded-xl p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-[#0969da] dark:bg-[#1f6feb] rounded-lg shadow-lg">
          <FiAlertCircle className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-base font-bold text-[#24292f] dark:text-[#f0f6fc]">{t('title')}</h3>
      </div>

      <div className="space-y-4 text-sm text-[#24292f] dark:text-[#c9d1d9] leading-relaxed">
        <div className="space-y-2 p-4 bg-white/50 dark:bg-black/20 rounded-lg">
          <div className="flex items-center gap-2 font-bold text-[#0969da] dark:text-[#58a6ff]">
            <FiCheckCircle className="w-4 h-4" />
            {t('importantFor', { period: periodLabel })}
          </div>
          <p>
            {t('description', { periodText })}
            {hasEntries && ` ${t('scrollHint')}`}
          </p>
        </div>

        <div className="space-y-2 p-4 bg-white/50 dark:bg-black/20 rounded-lg">
          <div className="flex items-center gap-2 font-bold text-[#0969da] dark:text-[#58a6ff]">
            <FiCheckCircle className="w-4 h-4" />
            {t('periodChange.title')}
          </div>
          <p>{t('periodChange.description')}</p>
        </div>
      </div>
    </div>
  )
}

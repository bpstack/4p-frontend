// app/components/groups/status/StatusTimeline.tsx

'use client'

import { GroupStatusRecord, GroupPayment } from '@/app/lib/groups'
import { useGroupStore } from '@/app/stores/useGroupStore'
import { FiCheckCircle, FiCircle } from 'react-icons/fi'
import { useTranslations } from 'next-intl'

interface StatusTimelineProps {
  status: GroupStatusRecord | null
}

export function StatusTimeline({ status }: StatusTimelineProps) {
  const t = useTranslations('groups')
  const { payments } = useGroupStore()

  const TIMELINE_STEPS = [
    { key: 'booking', label: t('statusCards.bookingConfirmed') },
    { key: 'contract', label: t('statusCards.contractSigned') },
    { key: 'rooming', label: t('statusCards.roomingList') },
    { key: 'balance', label: t('statusCards.balancePaid') },
  ] as const

  if (!status) return null

  const completedSteps = {
    booking: status.booking_confirmed,
    contract: status.contract_signed,
    rooming: status.rooming_status === 'received',
    balance: (() => {
      // Calcular si está pagado desde payments
      const totalExpected = payments.reduce(
        (sum: number, p: GroupPayment) => sum + parseFloat(String(p.amount || 0)),
        0
      )
      const totalPaid = payments.reduce(
        (sum: number, p: GroupPayment) => sum + parseFloat(String(p.amount_paid || 0)),
        0
      )
      return totalExpected > 0 && totalPaid >= totalExpected
    })(),
  }

  const progress = Object.values(completedSteps).filter(Boolean).length
  const progressPercentage = (progress / TIMELINE_STEPS.length) * 100

  return (
    <div className="bg-white dark:bg-[#0D1117] rounded-lg border border-gray-200 dark:border-gray-800 p-6">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t('statusCards.groupProgress')}
          </h3>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {progress} {t('statusCards.of')} {TIMELINE_STEPS.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="space-y-4">
        {TIMELINE_STEPS.map((step, index) => {
          const isCompleted = completedSteps[step.key]
          const isLast = index === TIMELINE_STEPS.length - 1

          return (
            <div key={step.key} className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <FiCheckCircle className="w-5 h-5" />
                  ) : (
                    <FiCircle className="w-5 h-5" />
                  )}
                </div>
                {!isLast && (
                  <div
                    className={`w-0.5 h-8 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>

              {/* Label */}
              <div className="flex-1 pt-1">
                <p
                  className={`text-sm font-medium ${
                    isCompleted
                      ? 'text-gray-900 dark:text-gray-100'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {step.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

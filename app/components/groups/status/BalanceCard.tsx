// app/components/groups/status/BalanceCard.tsx

'use client'

import { useEffect, useState } from 'react'
import { useGroupStore } from '@/app/stores/useGroupStore'
import { formatCurrency } from '@/app/lib/helpers/utils'
import { FiDollarSign, FiCheckCircle, FiAlertCircle, FiClock } from 'react-icons/fi'
import { useTranslations } from 'next-intl'

interface BalanceCardProps {
  groupId: number
}

interface BalanceState {
  status: 'pending' | 'partial' | 'paid'
  totalExpected: number
  totalPaid: number
  remaining: number
  percentagePaid: number
}

export function BalanceCard({ groupId }: BalanceCardProps) {
  const t = useTranslations('groups')
  const { currentGroup, payments, refreshPayments } = useGroupStore()

  const [balance, setBalance] = useState<BalanceState>({
    status: 'pending',
    totalExpected: 0,
    totalPaid: 0,
    remaining: 0,
    percentagePaid: 0,
  })

  // Cargar pagos al montar
  useEffect(() => {
    refreshPayments(groupId)
  }, [groupId, refreshPayments])

  // Calcular balance en tiempo real desde los pagos
  useEffect(() => {
    // Helper para parsear valores que pueden ser string o number
    const parseAmount = (value: unknown): number => {
      if (typeof value === 'number') return value
      if (typeof value === 'string') return parseFloat(value) || 0
      return 0
    }

    const group_total = parseAmount(currentGroup?.total_amount)
    const payments_total = payments.reduce((sum, p) => sum + parseAmount(p.amount), 0)
    const totalExpected = group_total > 0 ? group_total : payments_total

    const totalPaid = payments.reduce((sum, p) => sum + parseAmount(p.amount_paid), 0)
    const remaining = totalExpected - totalPaid

    const percentagePaid = totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 0

    // Determinar estado automáticamente
    let status: 'pending' | 'partial' | 'paid' = 'pending'
    if (remaining <= 0 && totalExpected > 0) {
      status = 'paid'
    } else if (totalPaid > 0) {
      status = 'partial'
    }

    setBalance({
      status,
      totalExpected,
      totalPaid,
      remaining: Math.max(remaining, 0),
      percentagePaid: Math.max(0, Math.min(percentagePaid, 100)),
    })
  }, [payments, currentGroup])

  const getStatusConfig = () => {
    switch (balance.status) {
      case 'paid':
        return {
          icon: FiCheckCircle,
          label: t('statusCards.paid'),
          color:
            'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
          iconColor: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
        }
      case 'partial':
        return {
          icon: FiAlertCircle,
          label: t('statusCards.partialPayment'),
          color:
            'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
          iconColor: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        }
      case 'pending':
      default:
        return {
          icon: FiClock,
          label: t('statusCards.pending'),
          color:
            'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        }
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  return (
    <div className="bg-white dark:bg-[#0D1117] rounded-lg border border-gray-200 dark:border-gray-800 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 ${statusConfig.bgColor} rounded-lg flex items-center justify-center`}
          >
            <FiDollarSign className={`w-4 h-4 ${statusConfig.iconColor}`} />
          </div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t('statusCards.balance')}
          </h4>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-md text-xs font-medium ${statusConfig.color}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            {statusConfig.label}
          </span>
          <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
            {balance.percentagePaid}%
          </span>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                balance.status === 'paid'
                  ? 'bg-green-500 dark:bg-green-400'
                  : balance.status === 'partial'
                    ? 'bg-blue-500 dark:bg-blue-400'
                    : 'bg-yellow-500 dark:bg-yellow-400'
              }`}
              style={{ width: `${balance.percentagePaid}%` }}
            />
          </div>
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200 dark:border-gray-800">
          <div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">
              {t('statusCards.totalExpected')}
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(balance.totalExpected, currentGroup?.currency)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">
              {t('statusCards.paidAmount')}
            </p>
            <p className="text-sm font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(balance.totalPaid, currentGroup?.currency)}
            </p>
          </div>
        </div>

        {/* Remaining Amount (solo si hay pendiente) */}
        {balance.remaining > 0 && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">
              {t('statusCards.pendingPayment')}
            </p>
            <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
              {formatCurrency(balance.remaining, currentGroup?.currency)}
            </p>
          </div>
        )}

        {/* Info Helper */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 italic">
            {t('statusCards.balanceHint')}
          </p>
        </div>
      </div>
    </div>
  )
}

// app/components/groups/history/HistoryItem.tsx

'use client'

import { useTranslations } from 'next-intl'
import { GroupHistoryRecord, HistoryAction } from '@/app/lib/groups'
import { FiPlus, FiEdit, FiTrash2, FiCheckCircle, FiDollarSign, FiClock } from 'react-icons/fi'

interface HistoryItemProps {
  record: GroupHistoryRecord
}

// Campos técnicos que NO deben mostrarse
const IGNORED_FIELDS = [
  'id',
  'group_id',
  'created_at',
  'updated_at',
  'created_by',
  'updated_by',
  'created_by_username',
  'updated_by_username',
]

// Mapeo de nombres técnicos a claves de traducción
const FIELD_KEYS: Record<string, string> = {
  name: 'name',
  agency: 'agency',
  arrival_date: 'arrival_date',
  departure_date: 'departure_date',
  status: 'status',
  total_amount: 'total_amount',
  currency: 'currency',
  notes: 'notes',
  room_type: 'room_type',
  quantity: 'quantity',
  guests_per_room: 'guests_per_room',
  contact_name: 'contact_name',
  contact_email: 'contact_email',
  contact_phone: 'contact_phone',
  is_primary: 'is_primary',
  payment_name: 'payment_name',
  amount: 'amount',
  amount_paid: 'amount_paid',
  due_date: 'due_date',
  percentage: 'percentage',
  booking_confirmed: 'booking_confirmed',
  booking_confirmed_date: 'booking_confirmed_date',
  contract_signed: 'contract_signed',
  contract_signed_date: 'contract_signed_date',
  rooming_status: 'rooming_status',
  rooming_requested_date: 'rooming_requested_date',
  rooming_received_date: 'rooming_received_date',
  rooming_deadline: 'rooming_deadline',
  balance_status: 'balance_status',
  balance_requested_date: 'balance_requested_date',
  balance_paid_date: 'balance_paid_date',
  payment_order: 'payment_order',
  payment_status: 'payment_status',
  payment_method: 'payment_method',
  payment_date: 'payment_date',
  role: 'role',
  email: 'email',
  phone: 'phone',
}

// Mapeo de valores técnicos a claves de traducción
const VALUE_KEYS: Record<string, string> = {
  single: 'single',
  double_bed: 'double_bed',
  twin_beds: 'twin_beds',
  pending: 'pending',
  confirmed: 'confirmed',
  in_progress: 'in_progress',
  completed: 'completed',
  cancelled: 'cancelled',
  requested: 'requested',
  partial: 'partial',
  paid: 'paid',
  received: 'received',
  transfer: 'transfer',
  card: 'card',
  cash: 'cash',
  other: 'other',
}

export function HistoryItem({ record }: HistoryItemProps) {
  const t = useTranslations('groups.history')

  const ACTION_CONFIG = {
    [HistoryAction.CREATED]: {
      icon: FiPlus,
      label: t('actions.created'),
      color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
    },
    [HistoryAction.UPDATED]: {
      icon: FiEdit,
      label: t('actions.updated'),
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    },
    [HistoryAction.DELETED]: {
      icon: FiTrash2,
      label: t('actions.deleted'),
      color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
    },
    [HistoryAction.STATUS_CHANGED]: {
      icon: FiCheckCircle,
      label: t('actions.statusChanged'),
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
    },
    [HistoryAction.PAYMENT_UPDATED]: {
      icon: FiDollarSign,
      label: t('actions.paymentUpdated'),
      color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
    },
  }

  const config = ACTION_CONFIG[record.action]
  const Icon = config.icon

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatFieldName = (field: string) => {
    // Check if field has a translation key
    if (FIELD_KEYS[field]) {
      return t(`fields.${FIELD_KEYS[field]}`)
    }
    // Fallback to formatted field name
    return field
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const formatValue = (value: string, field?: string) => {
    // Check for null/undefined
    if (value === null || value === undefined || value === 'null' || value === 'undefined') {
      return '—'
    }

    // Check if it's a date field
    if (field && field.includes('date') && value && value.match(/^\d{4}-\d{2}-\d{2}/)) {
      return new Date(value).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    }

    // Check if it's a currency field
    if (field && (field.includes('amount') || field.includes('total')) && !isNaN(Number(value))) {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
      }).format(Number(value))
    }

    // Check if value has a translation key
    const valueKey = value.toLowerCase()
    if (VALUE_KEYS[valueKey]) {
      return t(`values.${VALUE_KEYS[valueKey]}`)
    }

    // Handle boolean values
    if (valueKey === '1' || valueKey === 'true') {
      return t('values.true')
    }
    if (valueKey === '0' || valueKey === 'false') {
      return t('values.false')
    }

    return value
  }

  const parseJSONChanges = (oldValue: string | null, newValue: string | null) => {
    try {
      const oldObj = oldValue ? JSON.parse(oldValue) : {}
      const newObj = newValue ? JSON.parse(newValue) : {}

      // Find changed fields
      const changes: Array<{ field: string; oldVal: unknown; newVal: unknown }> = []

      const allFields = new Set([...Object.keys(oldObj), ...Object.keys(newObj)])

      for (const field of allFields) {
        // Skip technical fields and undefined values
        if (IGNORED_FIELDS.includes(field)) continue

        const oldVal = oldObj[field]
        const newVal = newObj[field]

        // Skip if both are null/undefined
        if ((oldVal === null || oldVal === undefined) && (newVal === null || newVal === undefined))
          continue

        // Only add if values are actually different
        if (oldVal !== newVal) {
          changes.push({
            field,
            oldVal,
            newVal,
          })
        }
      }

      return changes.length > 0 ? changes : null
    } catch {
      return null
    }
  }

  // Try to parse JSON changes
  const jsonChanges =
    record.old_value && record.new_value
      ? parseJSONChanges(record.old_value, record.new_value)
      : null

  // Get readable description
  const getDescription = () => {
    const table = record.table_affected

    if (record.action === HistoryAction.CREATED) {
      if (table === 'hotel_groups') return t('descriptions.groupCreated')
      if (table === 'group_payments') return t('descriptions.paymentCreated')
      if (table === 'group_contacts') return t('descriptions.contactCreated')
      if (table === 'group_rooms') return t('descriptions.roomCreated')
      return t('descriptions.recordCreated')
    }

    if (record.action === HistoryAction.UPDATED) {
      if (table === 'hotel_groups') return t('descriptions.groupUpdated')
      if (table === 'group_payments') return t('descriptions.paymentUpdated')
      if (table === 'group_contacts') return t('descriptions.contactUpdated')
      if (table === 'group_rooms') return t('descriptions.roomUpdated')
      if (table === 'group_status') return t('descriptions.statusUpdated')
      return t('descriptions.recordUpdated')
    }

    if (record.action === HistoryAction.DELETED) {
      if (table === 'group_payments') return t('descriptions.paymentDeleted')
      if (table === 'group_contacts') return t('descriptions.contactDeleted')
      if (table === 'group_rooms') return t('descriptions.roomDeleted')
      return t('descriptions.recordDeleted')
    }

    return config.label
  }

  return (
    <div className="relative pl-8 pb-6 last:pb-0">
      {/* Timeline line */}
      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800 last:hidden" />

      {/* Icon */}
      <div
        className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center ${config.color}`}
      >
        <Icon className="w-3.5 h-3.5" />
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-[#151b23] rounded-lg border border-gray-200 dark:border-gray-800 p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {getDescription()}
            </p>
            {record.changed_by_username && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {t('byUser')}{' '}
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {record.changed_by_username}
                </span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <FiClock className="w-3 h-3" />
            {formatDate(record.changed_at)}
          </div>
        </div>

        {/* Changes */}
        {jsonChanges && jsonChanges.length > 0 ? (
          <div className="space-y-2">
            {jsonChanges.map((change, index) => (
              <div key={index} className="text-sm">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {formatFieldName(change.field)}
                </p>
                <div className="flex items-center gap-2">
                  {change.oldVal !== null && change.oldVal !== undefined && (
                    <>
                      <span className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded text-xs">
                        {formatValue(String(change.oldVal), change.field)}
                      </span>
                      <span className="text-gray-400">→</span>
                    </>
                  )}
                  <span className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                    {formatValue(String(change.newVal), change.field)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : record.field_changed && (record.old_value || record.new_value) ? (
          <div className="text-sm">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {formatFieldName(record.field_changed)}
            </p>
            <div className="flex items-center gap-2">
              {record.old_value && (
                <>
                  <span className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded text-xs">
                    {formatValue(record.old_value, record.field_changed)}
                  </span>
                  <span className="text-gray-400">→</span>
                </>
              )}
              {record.new_value && (
                <span className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                  {formatValue(record.new_value, record.field_changed)}
                </span>
              )}
            </div>
          </div>
        ) : null}

        {/* Notes */}
        {record.notes && (
          <p className="text-xs text-gray-600 dark:text-gray-400 italic mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
            {record.notes}
          </p>
        )}
      </div>
    </div>
  )
}

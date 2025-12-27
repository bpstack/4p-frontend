// app/components/booking/BookingWizard/steps/DateSpotStep.tsx

import { useRef, useEffect } from 'react'
import { FaCalendar, FaSpinner, FaArrowLeft } from 'react-icons/fa'
import { useTranslations } from 'next-intl'
import { formatDateLocal, formatDateForInput } from '@/app/lib/helpers/date'
import SimpleCalendar from '@/app/ui/calendar/simplecalendar'
import TimePicker from '@/app/ui/calendar/timepicker'
// inputClassName, selectClassName, textareaClassName available from '@/app/ui/panels' if needed
import type { BookingWizardState, BookingWizardActions } from '../types'

interface DateSpotStepProps {
  state: BookingWizardState
  actions: BookingWizardActions
}

// GitHub-style for full variant
const styles = {
  card: 'bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 sm:p-5',
  sectionTitle: 'text-lg font-medium text-[#24292f] dark:text-[#f0f6fc]',
  label: 'block text-sm font-medium text-[#24292f] dark:text-[#c9d1d9] mb-1',
  input:
    'w-full px-3 py-2 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-[#24292f] dark:text-[#c9d1d9] placeholder-[#57606a] dark:placeholder-[#8b949e] focus:outline-none focus:ring-1 focus:ring-[#0969da] dark:focus:ring-[#1f6feb] text-sm',
  buttonPrimary:
    'px-4 py-2 bg-[#0969da] hover:bg-[#0550ae] dark:bg-[#1f6feb] dark:hover:bg-[#1158c7] disabled:bg-[#d0d7de] dark:disabled:bg-[#30363d] disabled:text-[#8c959f] text-white rounded-md font-medium transition text-sm',
  buttonSecondary:
    'px-4 py-2 bg-[#f6f8fa] hover:bg-[#eaeef2] dark:bg-[#21262d] dark:hover:bg-[#30363d] text-[#24292f] dark:text-[#c9d1d9] rounded-md font-medium transition text-sm',
  spotGrid:
    'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-2 bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md',
  spotCard: (isSelected: boolean) =>
    `p-2 sm:p-3 rounded-md border-2 transition text-center cursor-pointer ${
      isSelected
        ? 'bg-[#ddf4ff] dark:bg-[#051d30] border-[#0969da] dark:border-[#1f6feb]'
        : 'bg-white dark:bg-[#161b22] border-[#d0d7de] dark:border-[#30363d] hover:border-[#0969da] dark:hover:border-[#58a6ff]'
    }`,
}

export default function DateSpotStep({ state, actions }: DateSpotStepProps) {
  const t = useTranslations('booking')
  const checkinRef = useRef<HTMLDivElement>(null)
  const checkoutRef = useRef<HTMLDivElement>(null)

  // Cerrar calendarios al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (checkinRef.current && !checkinRef.current.contains(event.target as Node)) {
        actions.setShowCheckinCalendar(false)
      }
      if (checkoutRef.current && !checkoutRef.current.contains(event.target as Node)) {
        actions.setShowCheckoutCalendar(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [actions])

  const normalizeLevel = (levelCode: string) => levelCode.replace('-', '')

  return (
    <div className={styles.card}>
      <div className="flex gap-2 items-center mb-4">
        <FaCalendar className="w-5 h-5 text-[#0969da] dark:text-[#58a6ff]" />
        <h2 className={styles.sectionTitle}>{t('dates.title')}</h2>
      </div>

      <div className="space-y-4">
        {/* Fechas - RESPONSIVE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Check-in */}
          <div className="relative" ref={checkinRef}>
            <label className={styles.label}>
              {t('dates.checkin')} <span className="text-[#cf222e] dark:text-[#f85149]">*</span>
            </label>
            <button
              type="button"
              onClick={() => {
                actions.setShowCheckinCalendar(!state.showCheckinCalendar)
                actions.setShowCheckoutCalendar(false)
              }}
              className="w-full px-3 py-2 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-[#24292f] dark:text-[#c9d1d9] focus:outline-none focus:ring-1 focus:ring-[#0969da] dark:focus:ring-[#1f6feb] text-sm text-left flex items-center justify-between"
            >
              <span
                className={
                  state.reservationData.expected_checkin_date
                    ? ''
                    : 'text-[#57606a] dark:text-[#8b949e]'
                }
              >
                {state.reservationData.expected_checkin_date
                  ? formatDateLocal(new Date(state.reservationData.expected_checkin_date))
                  : t('dates.selectDate')}
              </span>
              <FaCalendar className="w-4 h-4 text-[#57606a] dark:text-[#8b949e]" />
            </button>

            {state.showCheckinCalendar && (
              <div className="absolute z-40 mt-2 left-0 right-0 sm:right-auto sm:w-[290px]">
                <SimpleCalendar
                  selectedDate={
                    state.reservationData.expected_checkin_date
                      ? new Date(state.reservationData.expected_checkin_date)
                      : undefined
                  }
                  onSelect={(d) => {
                    if (d) {
                      actions.setReservationData({ expected_checkin_date: formatDateForInput(d) })
                    }
                    actions.setShowCheckinCalendar(false)
                  }}
                  onClose={() => actions.setShowCheckinCalendar(false)}
                />
              </div>
            )}

            <div className="mt-2 w-full sm:w-auto">
              <TimePicker
                value={state.reservationData.expected_checkin_time}
                onChange={(t) => actions.setReservationData({ expected_checkin_time: t })}
                openTo="right"
                label={t('dates.entryTime')}
              />
            </div>
          </div>

          {/* Check-out */}
          <div className="relative" ref={checkoutRef}>
            <label className={styles.label}>
              {t('dates.checkout')} <span className="text-[#cf222e] dark:text-[#f85149]">*</span>
            </label>
            <button
              type="button"
              onClick={() => {
                actions.setShowCheckoutCalendar(!state.showCheckoutCalendar)
                actions.setShowCheckinCalendar(false)
              }}
              className="w-full px-3 py-2 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-[#24292f] dark:text-[#c9d1d9] focus:outline-none focus:ring-1 focus:ring-[#0969da] dark:focus:ring-[#1f6feb] text-sm text-left flex items-center justify-between"
            >
              <span
                className={
                  state.reservationData.expected_checkout_date
                    ? ''
                    : 'text-[#57606a] dark:text-[#8b949e]'
                }
              >
                {state.reservationData.expected_checkout_date
                  ? formatDateLocal(new Date(state.reservationData.expected_checkout_date))
                  : t('dates.selectDate')}
              </span>
              <FaCalendar className="w-4 h-4 text-[#57606a] dark:text-[#8b949e]" />
            </button>

            {state.showCheckoutCalendar && (
              <div className="absolute z-40 mt-2 left-0 right-0 sm:left-auto sm:right-0 sm:w-[290px]">
                <SimpleCalendar
                  selectedDate={
                    state.reservationData.expected_checkout_date
                      ? new Date(state.reservationData.expected_checkout_date)
                      : undefined
                  }
                  onSelect={(d) => {
                    if (d) {
                      actions.setReservationData({ expected_checkout_date: formatDateForInput(d) })
                    }
                    actions.setShowCheckoutCalendar(false)
                  }}
                  onClose={() => actions.setShowCheckoutCalendar(false)}
                />
              </div>
            )}

            <div className="mt-2 w-full sm:w-auto sm:ml-auto">
              <TimePicker
                value={state.reservationData.expected_checkout_time}
                onChange={(t) => actions.setReservationData({ expected_checkout_time: t })}
                openTo="left"
                label={t('dates.exitTime')}
              />
            </div>
          </div>
        </div>

        {/* Info días */}
        {state.reservationData.expected_checkin_date &&
          state.reservationData.expected_checkout_date && (
            <div className="p-2 bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded text-sm text-[#57606a] dark:text-[#8b949e]">
              <strong>{actions.calculateDays()}</strong> {t('dates.daysStay')}
            </div>
          )}

        {/* Buscar disponibilidad */}
        <button
          onClick={() => {
            if (actions.validateDates()) actions.handleLoadAvailability()
          }}
          disabled={
            state.loading ||
            !state.reservationData.expected_checkin_date ||
            !state.reservationData.expected_checkout_date
          }
          className={
            styles.buttonSecondary +
            ' w-full flex items-center justify-center gap-2 disabled:opacity-50'
          }
        >
          {state.loading ? (
            <>
              <FaSpinner className="w-4 h-4 animate-spin" />
              {t('dates.searchingSpots')}
            </>
          ) : (
            t('dates.searchSpotsButton')
          )}
        </button>

        {/* Grid de plazas - RESPONSIVE */}
        {state.availableSpots.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-[#24292f] dark:text-[#c9d1d9] mb-2">
              {t('dates.availableSpots', { count: state.availableSpots.length })}
            </h3>
            <div className={styles.spotGrid}>
              {state.availableSpots.map((spot) => (
                <button
                  key={spot.id}
                  onClick={() => actions.handleSelectSpot(spot)}
                  className={styles.spotCard(state.selectedSpot?.id === spot.id)}
                >
                  <div className="text-xs sm:text-sm font-semibold text-[#24292f] dark:text-[#f0f6fc] mb-1">
                    {t('dates.floor', { level: normalizeLevel(spot.level_code) })}
                  </div>
                  <div className="text-base sm:text-lg font-bold text-[#0969da] dark:text-[#58a6ff]">
                    {t('dates.spotNumber', { number: spot.spot_number })}
                  </div>
                  <div className="text-xs text-[#57606a] dark:text-[#8b949e] capitalize mt-1 hidden sm:block">
                    {spot.spot_type.replace('_', ' ')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Campos adicionales - RESPONSIVE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className={styles.label}>{t('details.priceManual')}</label>
            <input
              type="number"
              step="0.01"
              value={state.reservationData.total_amount}
              onChange={(e) => actions.setReservationData({ total_amount: e.target.value })}
              placeholder={t('details.pricePlaceholder')}
              className={styles.input}
            />
          </div>

          <div>
            <label className={styles.label}>{t('details.source')}</label>
            <select
              value={state.reservationData.booking_source}
              onChange={(e) => actions.setReservationData({ booking_source: e.target.value })}
              className={styles.input}
            >
              <option value="direct">{t('sources.direct')}</option>
              <option value="booking_com">{t('sources.booking_com')}</option>
              <option value="airbnb">{t('sources.airbnb')}</option>
              <option value="expedia">{t('sources.expedia')}</option>
              <option value="agency_other">{t('sources.agency_other')}</option>
            </select>
          </div>
        </div>

        <div>
          <label className={styles.label}>{t('details.externalCode')}</label>
          <input
            type="text"
            value={state.reservationData.external_booking_id}
            onChange={(e) => actions.setReservationData({ external_booking_id: e.target.value })}
            placeholder={t('details.externalCodePlaceholder')}
            className={styles.input}
          />
        </div>

        <div>
          <label className={styles.label}>{t('details.notesOptional')}</label>
          <textarea
            value={state.reservationData.notes}
            onChange={(e) => actions.setReservationData({ notes: e.target.value })}
            rows={3}
            placeholder={t('details.notesPlaceholder')}
            className={styles.input + ' resize-none'}
          />
        </div>

        {/* Botones - RESPONSIVE */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            onClick={actions.prevStep}
            className={
              styles.buttonSecondary +
              ' flex-1 flex items-center justify-center gap-2 order-2 sm:order-1'
            }
          >
            <FaArrowLeft className="w-3 h-3" /> {t('actions.back')}
          </button>
          <button
            onClick={actions.nextStep}
            disabled={!state.selectedSpot}
            className={styles.buttonPrimary + ' flex-1 order-1 sm:order-2'}
          >
            {t('actions.continue')}
          </button>
        </div>
      </div>
    </div>
  )
}

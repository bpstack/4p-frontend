// app/components/conciliation/RoomPopover.tsx
'use client'

import { FiX } from 'react-icons/fi'
import { useTranslations } from 'next-intl'

interface RoomPopoverProps {
  rooms: string[]
  isReadOnly: boolean
  onClose: () => void
  onAddRoom: (room: string) => void
  onRemoveRoom: (room: string) => void
}

export default function RoomPopover({
  rooms,
  isReadOnly,
  onClose,
  onAddRoom,
  onRemoveRoom,
}: RoomPopoverProps) {
  const t = useTranslations('conciliation')

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl p-4 w-80">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t('roomPopover.title')} ({rooms.length}/15)
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {!isReadOnly && (
          <div className="mb-3">
            <input
              type="text"
              placeholder={t('roomPopover.placeholder')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onAddRoom(e.currentTarget.value)
                  e.currentTarget.value = ''
                }
              }}
              className="w-full px-3 py-2 text-sm border border-[#d0d7de] dark:border-[#30363d] rounded bg-white dark:bg-[#0d1117] text-[#24292f] dark:text-[#f0f6fc] placeholder:text-[#57606a] dark:placeholder:text-[#8b949e] focus:bg-white dark:focus:bg-[#0d1117] focus:border-[#0969da] dark:focus:border-[#58a6ff] focus:ring-2 focus:ring-[#0969da]/20 dark:focus:ring-[#58a6ff]/20"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('roomPopover.pressEnter')}
            </p>
          </div>
        )}

        <div className="space-y-1 max-h-60 overflow-y-auto">
          {rooms.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
              {t('roomPopover.noRooms')}
            </p>
          ) : (
            rooms.map((room) => (
              <div
                key={room}
                className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded text-sm"
              >
                <span className="text-gray-900 dark:text-gray-100 font-medium">{room}</span>
                {!isReadOnly && (
                  <button
                    onClick={() => onRemoveRoom(room)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}

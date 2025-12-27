// app/components/conciliation/GeneralNotes.tsx
'use client'

import { FiAlertCircle, FiPlus, FiUser, FiClock, FiTrash2 } from 'react-icons/fi'
import { useTranslations } from 'next-intl'

interface Note {
  id: string
  text: string
  author: string
  timestamp: string
  author_id: string
}

interface GeneralNotesProps {
  notes: Note[]
  newNoteText: string
  isReadOnly: boolean
  currentUserId: string | undefined
  onNewNoteChange: (text: string) => void
  onAddNote: () => void
  onDeleteNote: (noteId: string, authorId: string) => void
}

function formatNoteDate(timestamp: string) {
  const date = new Date(timestamp)
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function GeneralNotes({
  notes,
  newNoteText,
  isReadOnly,
  currentUserId,
  onNewNoteChange,
  onAddNote,
  onDeleteNote,
}: GeneralNotesProps) {
  const t = useTranslations('conciliation')

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden flex flex-col">
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <FiAlertCircle className="w-4 h-4" />
          {t('generalNotes.title')} ({notes.length})
        </h3>
      </div>

      <div className="p-4 flex-1 flex flex-col" style={{ maxHeight: '400px' }}>
        {!isReadOnly && (
          <div className="space-y-2 flex-shrink-0 mb-4">
            <textarea
              value={newNoteText}
              onChange={(e) => onNewNoteChange(e.target.value)}
              placeholder={t('generalNotes.placeholder')}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-[#d0d7de] dark:border-[#30363d] rounded bg-white dark:bg-[#0d1117] text-[#24292f] dark:text-[#f0f6fc] placeholder:text-[#57606a] dark:placeholder:text-[#8b949e] focus:bg-white dark:focus:bg-[#0d1117] focus:border-[#0969da] dark:focus:border-[#58a6ff] focus:ring-2 focus:ring-[#0969da]/20 dark:focus:ring-[#58a6ff]/20 resize-none"
            />
            <button
              onClick={onAddNote}
              disabled={!newNoteText.trim()}
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              {t('generalNotes.addNote')}
            </button>
          </div>
        )}

        <div className="space-y-2 overflow-y-auto flex-1">
          {notes.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-xs">
              {t('generalNotes.noNotes')}
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex flex-col gap-0.5 text-[10px] text-gray-600 dark:text-gray-400 min-w-0">
                    <div className="flex items-center gap-1">
                      <FiUser className="w-3 h-3 flex-shrink-0" />
                      <span className="font-medium truncate">{note.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiClock className="w-3 h-3 flex-shrink-0" />
                      <span>{formatNoteDate(note.timestamp)}</span>
                    </div>
                  </div>
                  {!isReadOnly && currentUserId === note.author_id && (
                    <button
                      onClick={() => onDeleteNote(note.id, note.author_id)}
                      className="text-red-500 hover:text-red-700 flex-shrink-0"
                      title={t('generalNotes.deleteNote')}
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
                  {note.text}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

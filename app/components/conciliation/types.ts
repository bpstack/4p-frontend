// app/components/conciliation/types.ts

import type { ConciliationDetail } from '@/app/lib/conciliation'

export interface ConciliationFormProps {
  conciliation: ConciliationDetail | null
  loading: boolean
  dayStatusMessage: string
  onUpdate: () => void
}

export interface TotalsCardProps {
  totalReception: number
  totalHousekeeping: number
  difference: number
}

export interface Note {
  id: string
  text: string
  author: string
  timestamp: string
  author_id: string
}

export interface RoomPopoverState {
  type: 'reception' | 'housekeeping'
  reason: string
  rooms: string[]
}

export interface NotePopoverState {
  type: 'reception' | 'housekeeping'
  reason: string
  notes: string[]
}

export interface RoomPopoverProps {
  rooms: string[]
  isReadOnly: boolean
  onClose: () => void
  onAddRoom: (room: string) => void
  onRemoveRoom: (room: string) => void
}

export interface NotePopoverProps {
  notes: string[]
  isReadOnly: boolean
  onClose: () => void
  onAddNote: (note: string) => void
  onRemoveNote: (note: string) => void
}

export interface GeneralNotesProps {
  notes: Note[]
  newNoteText: string
  isReadOnly: boolean
  currentUserId?: string
  onNewNoteChange: (text: string) => void
  onAddNote: () => void
  onDeleteNote: (noteId: string, authorId: string) => void
}

export interface ActionButtonsProps {
  status: string
  saving: boolean
  onSave: () => void
  onConfirm: () => void
  onReopen: () => void
  onClose: () => void
}

export interface DaySummaryProps {
  conciliation: ConciliationDetail
  baseRooms: number
}

// app/components/groups/GroupDetailClient.tsx

'use client'

// TODO (Estado unificado):
// Actualmente existe lógica de sincronización entre hotel_groups.status
// y group_status.booking_confirmed porque ambas tablas duplican el estado del grupo.
// Cuando se elimine esta duplicidad en la base de datos:
//   1. ELIMINAR toda la lógica de sincronización.
//   2. Unificar el estado en una sola tabla (decidir entre hotel_groups o group_status).
//   3. Simplificar updateGroup() y updateBooking() para evitar actualizaciones cruzadas.
//   4. Actualizar modelos, DTOs y store del frontend.
// IMPORTANTE: Este archivo depende directamente del diseño actual duplicado.

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useGroupStore } from '@/app/stores/useGroupStore'
import {
  GroupWithDetails,
  GroupPayment,
  GroupRoom,
  useGroup,
  useGroupPayments,
  useGroupContacts,
  useGroupRooms,
} from '@/app/lib/groups'
import { GroupHeader } from './layout/GroupHeader'
import { TabNavigation } from './layout/TabNavigation'
import { GroupDetailSummaryPanel } from './layout/GroupDetailSummaryPanel'
import { OverviewTab } from './tabs/OverviewTab'
import { PaymentsTab } from './tabs/PaymentsTab'
import { ContactsTab } from './tabs/ContactsTab'
import { RoomsTab } from './tabs/RoomsTab'
import { StatusTab } from './tabs/StatusTab'
import { HistoryTab } from './tabs/HistoryTab'
import { PaymentPanel } from './panels/PaymentPanel'
import { ContactPanel } from './panels/ContactPanel'
import { RoomPanel } from './panels/RoomPanel'
import { EditGroupPanel } from './panels/EditGroupPanel'
import { LoadingSpinner } from './shared/LoadingSpinner'

interface GroupDetailClientProps {
  initialGroup: GroupWithDetails
}

export function GroupDetailClient({ initialGroup }: GroupDetailClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'
  const panel = searchParams.get('panel')
  const highlightId = searchParams.get('highlight')
  const t = useTranslations('groups')

  const { currentGroup, setCurrentGroup, setActiveTab, setHighlight } = useGroupStore()

  const { data: _groupData } = useGroup(currentGroup?.id)
  const { data: paymentsData } = useGroupPayments(currentGroup?.id)
  const payments = paymentsData?.payments ?? []
  const { data: contacts = [] } = useGroupContacts(currentGroup?.id)
  const { data: rooms = [] } = useGroupRooms(currentGroup?.id)

  // Inicializar grupo en el store
  useEffect(() => {
    setCurrentGroup(initialGroup)
  }, [initialGroup, setCurrentGroup])

  // Sincronizar activeTab con query params
  useEffect(() => {
    setActiveTab(activeTab)
  }, [activeTab, setActiveTab])

  // Sincronizar highlight con query params
  useEffect(() => {
    if (highlightId) {
      setHighlight(parseInt(highlightId))
    } else {
      setHighlight(null)
    }
  }, [highlightId, setHighlight])

  const handleClosePanel = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('panel')
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const handleEditSuccess = () => {
    // Las mutaciones ya invalidan los queries necesarios vía React Query
  }

  // Payment Panel Logic
  const isPaymentPanelOpen =
    panel === 'new-payment' || (panel?.startsWith('edit-payment-') ?? false)
  const editingPaymentId = panel?.startsWith('edit-payment-')
    ? parseInt(panel.replace('edit-payment-', ''))
    : null
  const editingPayment = editingPaymentId
    ? payments.find((p: GroupPayment) => p.id === editingPaymentId)
    : undefined

  // Contact Panel Logic
  const isContactPanelOpen =
    panel === 'new-contact' || (panel?.startsWith('edit-contact-') ?? false)
  const editingContactId = panel?.startsWith('edit-contact-')
    ? parseInt(panel.replace('edit-contact-', ''))
    : null
  const editingContact = editingContactId
    ? contacts.find((c) => c.id === editingContactId)
    : undefined

  // Room Panel Logic
  const isRoomPanelOpen = panel === 'new-room' || (panel?.startsWith('edit-room-') ?? false)
  const editingRoomId = panel?.startsWith('edit-room-')
    ? parseInt(panel.replace('edit-room-', ''))
    : null
  const editingRoom = editingRoomId
    ? rooms.find((r: GroupRoom) => r.id === editingRoomId)
    : undefined

  // Edit Group Panel Logic
  const isEditGroupPanelOpen = panel === 'edit-group'

  if (!currentGroup) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] flex items-center justify-center">
        <LoadingSpinner size="lg" message={t('loadingGroup')} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#010409]">
      <GroupHeader group={currentGroup} />

      <TabNavigation groupId={currentGroup.id} />

      <div className="max-w-[1400px] px-4 md:px-6 py-6">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 min-[1400px]:grid-cols-4 gap-6">
          {/* Left Column - Main Content (Tabs) */}
          <div className="min-[1400px]:col-span-3">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'payments' && <PaymentsTab />}
            {activeTab === 'contacts' && <ContactsTab />}
            {activeTab === 'rooms' && <RoomsTab />}
            {activeTab === 'status' && <StatusTab />}
            {activeTab === 'history' && <HistoryTab />}
          </div>

          {/* Right Column - Summary Panel (visible on >= 1400px) */}
          <div className="hidden min-[1400px]:block">
            <GroupDetailSummaryPanel />
          </div>
        </div>
      </div>

      {/* Payment Panel */}
      <PaymentPanel
        isOpen={isPaymentPanelOpen}
        onClose={handleClosePanel}
        payment={editingPayment}
        groupId={currentGroup.id}
        totalAmount={currentGroup.total_amount || 0}
      />

      {/* Contact Panel */}
      <ContactPanel
        isOpen={isContactPanelOpen}
        onClose={handleClosePanel}
        contact={editingContact}
        groupId={currentGroup.id}
      />

      {/* Room Panel */}
      <RoomPanel
        isOpen={isRoomPanelOpen}
        onClose={handleClosePanel}
        room={editingRoom}
        groupId={currentGroup.id}
      />

      {/* Edit Group Panel */}
      <EditGroupPanel
        isOpen={isEditGroupPanelOpen}
        onClose={handleClosePanel}
        group={currentGroup}
        onSuccess={handleEditSuccess}
      />
    </div>
  )
}

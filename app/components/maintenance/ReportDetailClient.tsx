// app/components/maintenance/ReportDetailClient.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useMaintenanceStore } from '@/app/stores/useMaintenanceStore'
import { maintenanceApi } from '@/app/lib/maintenance/maintenanceApi'
import type { ReportWithDetails } from '@/app/lib/maintenance/maintenance'
import { ReportHeader } from './layout/ReportHeader'
import { TabNavigation } from './layout/TabNavigation'
import { DetailTab } from './tabs/DetailTab'
import { HistoryTab } from './tabs/HistoryTab'
import { LoadingSpinner } from './shared/LoadingSpinner'
import { EditReportPanel } from './panels/EditReportPanel'
import { ConfirmDialog } from './shared/ConfirmDialog'
import toast from 'react-hot-toast'

interface ReportDetailClientProps {
  initialReport: ReportWithDetails
}

export function ReportDetailClient({ initialReport }: ReportDetailClientProps) {
  const t = useTranslations('maintenance')
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'detail'

  const { currentReport, setCurrentReport, setActiveTab, refreshReport } = useMaintenanceStore()

  // Estados para editar y eliminar
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setCurrentReport(initialReport)
  }, [initialReport, setCurrentReport])

  useEffect(() => {
    setActiveTab(activeTab)
  }, [activeTab, setActiveTab])

  const handleEdit = () => {
    setIsEditPanelOpen(true)
  }

  const handleCloseEditPanel = () => {
    setIsEditPanelOpen(false)
    // Refrescar datos después de editar
    if (currentReport) {
      refreshReport(currentReport.id)
    }
  }

  const handleDelete = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!currentReport) return

    try {
      setIsDeleting(true)
      await maintenanceApi.delete(currentReport.id)
      toast.success(t('detail.toast.reportDeleted'))
      router.push('/dashboard/maintenance')
    } catch (error) {
      const message = error instanceof Error ? error.message : t('detail.toast.deleteError')
      toast.error(message)
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  if (!currentReport) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] flex items-center justify-center">
        <LoadingSpinner size="lg" message={t('detail.loadingReport')} />
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-[#010409]">
        <ReportHeader report={currentReport} onEdit={handleEdit} onDelete={handleDelete} />

        <TabNavigation reportId={currentReport.id} />

        <div className="max-w-[1400px] px-4 md:px-6 py-6">
          {activeTab === 'detail' && <DetailTab />}
          {activeTab === 'history' && <HistoryTab />}
        </div>
      </div>

      {/* Panel de edición */}
      <EditReportPanel
        isOpen={isEditPanelOpen}
        onClose={handleCloseEditPanel}
        report={currentReport}
        onSuccess={() => refreshReport(currentReport.id)}
      />

      {/* Diálogo de confirmación de eliminación */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('confirm.deleteTitle')}
        message={t('confirm.deleteMessage', { title: currentReport.title })}
        confirmText={t('confirm.deleteButton')}
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </>
  )
}

// app/components/logbooks/NewCommentEntry.tsx

'use client'

import { useEffect, useState } from 'react'
import { FiSend, FiMessageSquare } from 'react-icons/fi'
import { useDepartments } from '@/app/lib/logbooks/hooks/useDepartments'
import {
  SlidePanel,
  SlidePanelFooterButtons,
  FormField,
  selectClassName,
  textareaClassName,
} from '@/app/ui/panels'
import { useTranslations } from 'next-intl'

type ImportanceLevel = 'baja' | 'media' | 'alta' | 'urgente'

export interface NewCommentPayload {
  comment: string
  importance_level: ImportanceLevel
  department_id: number
}

export default function NewCommentEntry({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialComment = '',
  initialPriority = 'baja',
  initialDepartment,
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: NewCommentPayload) => Promise<void>
  title?: string
  initialComment?: string
  initialPriority?: ImportanceLevel
  initialDepartment?: number | null
}) {
  const [comment, setComment] = useState<string>(initialComment)
  const [priority, setPriority] = useState<ImportanceLevel>(initialPriority)
  const [department, setDepartment] = useState<number | null>(initialDepartment ?? null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { departments } = useDepartments()
  const t = useTranslations('logbooks')

  useEffect(() => {
    if (isOpen) {
      setComment(initialComment)
      setPriority(initialPriority)
      setDepartment(initialDepartment ?? null)
      setIsSubmitting(false)
    }
  }, [isOpen, initialComment, initialPriority, initialDepartment])

  const handleSave = async () => {
    if (!comment.trim()) return
    if (department === null) return
    setIsSubmitting(true)
    try {
      await onSubmit({
        comment: comment.trim(),
        importance_level: priority,
        department_id: department,
      })
      onClose()
    } catch {
      // toast/parent error handling expected outside
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={title || t('modals.newComment.title')}
      subtitle={t('modals.newComment.subtitle')}
      size="xl"
      position="left"
      headerIcon={<FiMessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
      footer={
        <SlidePanelFooterButtons
          onCancel={onClose}
          onSubmit={handleSave}
          cancelText={t('modals.newComment.footer.cancel')}
          submitText={t('modals.newComment.footer.submit')}
          submitIcon={<FiSend className="w-4 h-4" />}
          isSubmitting={isSubmitting}
          submitDisabled={!comment.trim() || department === null}
          submitVariant="success"
        />
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!isSubmitting) void handleSave()
        }}
        className="space-y-5"
      >
        <FormField label={t('modals.newComment.fields.comment')} required>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className={textareaClassName}
            rows={4}
            placeholder={t('modals.newComment.placeholders.comment')}
            required
            minLength={3}
            disabled={isSubmitting}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label={t('modals.newComment.fields.priority')}>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as ImportanceLevel)}
              className={selectClassName}
              disabled={isSubmitting}
            >
              <option value="baja">{t('priorities.low')}</option>
              <option value="media">{t('priorities.medium')}</option>
              <option value="alta">{t('priorities.high')}</option>
              <option value="urgente">{t('priorities.critical')}</option>
            </select>
          </FormField>

          <FormField label={t('modals.newComment.fields.department')}>
            <select
              value={department ?? ''}
              onChange={(e) => setDepartment(e.target.value ? Number(e.target.value) : null)}
              className={selectClassName}
              disabled={isSubmitting}
            >
              <option value="">{t('modals.newComment.departmentPlaceholder')}</option>
              {departments.length > 0 ? (
                departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.displayName}
                  </option>
                ))
              ) : (
                <>
                  <option value={1}>{t('departments.reception')}</option>
                  <option value={2}>{t('departments.housekeeping')}</option>
                  <option value={3}>{t('departments.maintenance')}</option>
                </>
              )}
            </select>
          </FormField>
        </div>
      </form>
    </SlidePanel>
  )
}

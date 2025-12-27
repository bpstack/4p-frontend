// app/components/blacklist/mains/DeleteButton.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/app/components/blacklist/ui/Button'
import { deleteBlacklist } from '@/app/dashboard/blacklist/actions/deleteBlacklist'
import { IoTrashOutline } from 'react-icons/io5'
import toast from 'react-hot-toast'

interface DeleteButtonProps {
  entryId: string
}

export function DeleteButton({ entryId }: DeleteButtonProps) {
  const t = useTranslations('blacklist')
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(t('delete.confirmMessage'))) {
      return
    }

    setIsDeleting(true)
    toast.loading(t('delete.deleting'))

    try {
      const result = await deleteBlacklist(entryId)

      toast.dismiss()

      if (result.success) {
        toast.success(t('delete.success'))
        router.push('/dashboard/blacklist')
        router.refresh()
      } else {
        toast.error(result.error || t('delete.error'))
      }
    } catch (error) {
      toast.dismiss()
      const message = error instanceof Error ? error.message : t('delete.error')
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      variant="danger"
      onClick={handleDelete}
      isLoading={isDeleting}
      leftIcon={<IoTrashOutline size={18} />}
    >
      {t('delete.button')}
    </Button>
  )
}

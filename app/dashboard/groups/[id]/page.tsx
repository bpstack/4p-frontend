// app/dashboard/groups/[id]/page.tsx

'use client'

import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { GroupDetailClient } from '@/app/components/groups/GroupDetailClient'
import { LoadingSpinner } from '@/app/components/groups/shared/LoadingSpinner'
import { useGroup } from '@/app/lib/groups'

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('groups')
  const groupId = parseInt(params.id as string)

  const { data: group, isLoading, isError } = useGroup(groupId)

  if (Number.isNaN(groupId)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#010409] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Error</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('invalidGroupId')}</p>
          <button
            onClick={() => router.push('/dashboard/groups')}
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            {t('backToList')}
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#010409] flex items-center justify-center">
        <LoadingSpinner size="lg" message={t('loadingGroup')} />
      </div>
    )
  }

  if (isError || !group) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#010409] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Error</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('groupNotFound')}</p>
          <button
            onClick={() => router.push('/dashboard/groups')}
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hoverbg-blue-700 transition-colors"
          >
            {t('backToList')}
          </button>
        </div>
      </div>
    )
  }

  return <GroupDetailClient initialGroup={group} />
}

// Este es el archivo real cuando deje de usar localstorage pero ahora mismo necesito hacer 'use client' en este archivo

// app/groups/[id]/page.tsx

// import { groupsApi } from '@/app/api/groups/route'
// import { GroupDetailClient } from '@/app/components/groups/GroupDetailClient'
// import { notFound } from 'next/navigation'

// interface PageProps {
//   params: Promise<{ id: string }>
// }

// export default async function GroupDetailPage({ params }: PageProps) {
//   const { id } = await params
//   const groupId = parseInt(id)

//   if (isNaN(groupId)) {
//     notFound()
//   }

//   try {
//     const response = await groupsApi.getById(groupId)
//     const group = response.data

//     return <GroupDetailClient initialGroup={group} />
//   } catch (error) {
//     console.error('Error loading group:', error)
//     notFound()
//   }
// }

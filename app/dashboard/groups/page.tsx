// app/dashboard/groups/page.tsx - Server Component with SSR

import { Suspense } from 'react'
import { getGroups } from './actions/getGroups'
import { GroupsListClient } from '@/app/components/groups/GroupsListClient'
import { GroupsLoadingState } from '@/app/components/groups/shared/GroupsLoadingState'

export default async function GroupsPage() {
  let initialGroups = undefined

  try {
    const response = await getGroups()
    initialGroups = response.data
  } catch (error) {
    // Si falla el fetch inicial, el client component cargará los datos
    console.error('[GroupsPage] Error fetching initial groups:', error)
  }

  return (
    <Suspense fallback={<GroupsLoadingState />}>
      <GroupsListClient initialGroups={initialGroups} />
    </Suspense>
  )
}

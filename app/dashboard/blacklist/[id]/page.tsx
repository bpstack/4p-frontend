// app/dashboard/blacklist/[id]/page.tsx

/**
 * Pagina de detalle de registro Blacklist
 * - Server Component (SSR) que carga datos iniciales
 * - Renderiza BlacklistDetailClient para interactividad
 */

import { notFound } from 'next/navigation'
import { getBlacklistById } from '../actions'
import { BlacklistDetailClient } from '@/app/components/blacklist/BlacklistDetailClient'

// Revalidar cada 30 segundos
export const revalidate = 30

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function BlacklistDetailPage({ params }: PageProps) {
  const { id } = await params

  let data

  try {
    data = await getBlacklistById(id)
  } catch {
    notFound()
  }

  const { entry, audit_trail } = data

  return <BlacklistDetailClient entry={entry} audit_trail={audit_trail} />
}

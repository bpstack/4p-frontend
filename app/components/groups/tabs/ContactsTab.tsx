// app/components/groups/tabs/ContactsTab.tsx

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useGroupStore } from '@/app/stores/useGroupStore'
import { useGroupContacts } from '@/app/lib/groups'
import { ContactCard } from '../cards/ContactCard'
import { EmptyState } from '../shared/EmptyState'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { FiPlus, FiUsers } from 'react-icons/fi'

export function ContactsTab() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currentGroup } = useGroupStore()
  const t = useTranslations('groups')

  const groupId = currentGroup?.id
  const { data: contacts = [], isLoading } = useGroupContacts(groupId)

  const handleCreateContact = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('panel', 'new-contact')
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const handleEditContact = (contactId: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('panel', `edit-contact-${contactId}`)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="md" message={t('contacts.loadingContacts')} />
      </div>
    )
  }

  const primaryContact = contacts.find((c) => c.is_primary)
  const otherContacts = contacts.filter((c) => !c.is_primary)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <FiUsers className="w-4 h-4" />
          {t('contacts.groupContacts')} ({contacts.length})
        </h3>
        <button
          onClick={handleCreateContact}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 dark:bg-green-700 text-white text-xs font-medium rounded-md hover:bg-green-700 dark:hover:bg-green-800 transition-colors"
        >
          <FiPlus className="w-3.5 h-3.5" />
          {t('contacts.newContact')}
        </button>
      </div>

      {/* Contacts List */}
      {contacts.length === 0 ? (
        <EmptyState
          icon={<FiUsers className="w-12 h-12" />}
          title={t('contacts.noContacts')}
          description={t('contacts.addFirstContact')}
          action={
            <button
              onClick={handleCreateContact}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              {t('contacts.createFirst')}
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {/* Primary Contact */}
          {primaryContact && (
            <div>
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('contacts.primaryContact')}
              </h4>
              <ContactCard
                contact={primaryContact}
                onEdit={() => handleEditContact(primaryContact.id)}
              />
            </div>
          )}

          {/* Other Contacts */}
          {otherContacts.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('contacts.otherContacts')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {otherContacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onEdit={() => handleEditContact(contact.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      {contacts.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-xs text-blue-800 dark:text-blue-300">
            {t('contacts.primaryContactTip')}
          </p>
        </div>
      )}
    </div>
  )
}

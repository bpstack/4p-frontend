// app/lib/activity/types.ts

export type ActivitySource = 'cashier' | 'groups' | 'logbook' | 'maintenance'

export interface UnifiedActivity {
  id: string
  source: ActivitySource
  action: string
  user_id: string
  username: string
  timestamp: string
  record_id: string | number | null
}

export interface ActivityResponse {
  success: boolean
  data: UnifiedActivity[]
  meta: {
    count: number
    limit: number
    filters: {
      source: ActivitySource | null
      user_id: string | null
    }
  }
}

export interface ActivityFilters {
  limit?: number
  source?: ActivitySource
  user_id?: string
}

// app/lib/conciliation/config.ts

import type { ReceptionReason, HousekeepingReason, Direction } from './types'

// ═══════════════════════════════════════════════════════
// CONFIGURATION TYPES
// ═══════════════════════════════════════════════════════

interface ReasonConfig {
  label: string
  direction: Direction
  order: number
}

// ═══════════════════════════════════════════════════════
// RECEPTION CONFIG
// ═══════════════════════════════════════════════════════

export const RECEPTION_CONFIG: Record<ReceptionReason, ReasonConfig> = {
  base_rooms: {
    label: 'Número de hab. Facturadas',
    direction: 'add',
    order: 1,
  },
  gratuity: {
    label: 'Gratuitas',
    direction: 'add',
    order: 2,
  },
  no_show: {
    label: 'NO SHOW',
    direction: 'subtract',
    order: 3,
  },
  room_change: {
    label: 'Hab sucia por cambio hab',
    direction: 'add',
    order: 4,
  },
  other: {
    label: 'Otros',
    direction: 'add',
    order: 5,
  },
}

// ═══════════════════════════════════════════════════════
// HOUSEKEEPING CONFIG
// ═══════════════════════════════════════════════════════

export const HOUSEKEEPING_CONFIG: Record<HousekeepingReason, ReasonConfig> = {
  cleaned: {
    label: 'Total hab realmente limpiadas',
    direction: 'add',
    order: 1,
  },
  do_not_disturb: {
    label: 'No limpiadas por NO MOLESTEN',
    direction: 'add',
    order: 2,
  },
  ooo_cleaned: {
    label: 'Limpiadas que estaban OOO',
    direction: 'subtract',
    order: 3,
  },
  pending_cleaned: {
    label: 'Limpiadas que estaban LS día anterior',
    direction: 'subtract',
    order: 4,
  },
  pending_to_clean: {
    label: 'Hab. LS que se dejan pendientes',
    direction: 'add',
    order: 5,
  },
  room_clean: {
    label: 'Habitación encontrada limpia',
    direction: 'add',
    order: 6,
  },
  other: {
    label: 'Otros',
    direction: 'add',
    order: 7,
  },
}

// ═══════════════════════════════════════════════════════
// ORDERED ARRAYS
// ═══════════════════════════════════════════════════════

export const RECEPTION_REASONS_ORDERED: ReceptionReason[] = (
  Object.entries(RECEPTION_CONFIG) as [ReceptionReason, ReasonConfig][]
)
  .sort((a, b) => a[1].order - b[1].order)
  .map(([key]) => key)

export const HOUSEKEEPING_REASONS_ORDERED: HousekeepingReason[] = (
  Object.entries(HOUSEKEEPING_CONFIG) as [HousekeepingReason, ReasonConfig][]
)
  .sort((a, b) => a[1].order - b[1].order)
  .map(([key]) => key)

// app/components/parking/index.ts
/**
 * Barrel export del módulo de parking compartido
 */

// Componentes
export { StatusBadge } from './StatusBadge'
export { ActionDropdown } from './ActionDropdown'
export { BookingsListClient } from './BookingsListClient'
export { VehicleSearchModal } from './VehicleSearchModal'

// Booking components
export {
  InfoCard,
  InfoRow,
  CheckInModal,
  CheckOutModal,
  EditBookingModal,
  BookingHeader,
  BookingDetailClient,
} from './bookings'

// Helpers
export * from './helpers'

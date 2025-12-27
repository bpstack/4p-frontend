// app/components/search/index.ts
export { GlobalSearch } from './GlobalSearch'
export { MobileSearchModal } from './MobileSearchModal'
export { useGlobalSearch, getMinChars, isParkingCode } from './useGlobalSearch'
export type {
  ParkingResult,
  MaintenanceResult,
  GroupResult,
  BlacklistResult,
  SearchResults,
} from './useGlobalSearch'

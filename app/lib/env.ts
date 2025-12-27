// Centraliza las URLs de API para cliente y servidor
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
export const SERVER_API_BASE_URL = process.env.NEXT_SERVER_API_URL || API_BASE_URL

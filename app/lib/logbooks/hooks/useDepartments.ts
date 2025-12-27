// app/lib/logbooks/hooks/useDepartments.ts

import { useState, useEffect, useCallback } from 'react'
import { departmentsApi, type Department } from '@/app/lib/departments'

/**
 * Formatea el nombre del departamento para visualización
 * @example
 * formatDepartmentName('backoffice') => 'Back Office'
 * formatDepartmentName('pisos') => 'Pisos'
 * formatDepartmentName('mantenimiento') => 'Mantenimiento'
 */
export function formatDepartmentName(name: string): string {
  // Casos especiales
  const specialCases: Record<string, string> = {
    backoffice: 'Back Office',
    'back office': 'Back Office',
    'recursos humanos': 'Recursos Humanos',
    'recursos-humanos': 'Recursos Humanos',
  }

  // Verificar casos especiales primero
  const lowerName = name.toLowerCase().trim()
  if (specialCases[lowerName]) {
    return specialCases[lowerName]
  }

  // Capitalizar primera letra de cada palabra si tiene espacios o guiones
  if (name.includes(' ') || name.includes('-')) {
    return name
      .split(/[\s-]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  // Capitalizar primera letra para palabras simples
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
}

export interface FormattedDepartment extends Department {
  displayName: string // Nombre formateado para mostrar
}

/**
 * Hook para gestionar departamentos con nombres formateados
 *
 * NOTA: Para crear, editar y eliminar departamentos, usa la página
 * /dashboard/departments directamente con departmentsApi
 *
 * Este hook es principalmente para LECTURA y VISUALIZACIÓN en formularios
 */
export function useDepartments() {
  const [departments, setDepartments] = useState<FormattedDepartment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar departamentos (memoizado para evitar re-renders innecesarios)
  const loadDepartments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await departmentsApi.getAll()

      // Formatear nombres al cargar
      const formattedDepartments: FormattedDepartment[] = data.map((dept) => ({
        ...dept,
        displayName: formatDepartmentName(dept.name),
      }))

      // Ordenar alfabéticamente por nombre formateado
      formattedDepartments.sort((a, b) =>
        a.displayName.localeCompare(b.displayName, 'es', { sensitivity: 'base' })
      )

      setDepartments(formattedDepartments)
    } catch (err) {
      console.error('Error loading departments:', err)
      setError('Error loading departments')

      // Fallback departments con formato
      const fallbackDepts: FormattedDepartment[] = [
        { id: 1, name: 'pisos', displayName: 'Pisos' },
        { id: 2, name: 'mantenimiento', displayName: 'Mantenimiento' },
        { id: 3, name: 'reservas', displayName: 'Reservas' },
        { id: 4, name: 'parking', displayName: 'Parking' },
        { id: 5, name: 'clientes', displayName: 'Clientes' },
        { id: 6, name: 'backoffice', displayName: 'Back Office' },
      ]
      setDepartments(fallbackDepts)
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar al montar el componente
  useEffect(() => {
    loadDepartments()
  }, [loadDepartments])

  /**
   * Obtiene el nombre formateado de un departamento por ID
   * @param id - ID del departamento
   * @returns Nombre formateado o fallback
   */
  const getDepartmentName = useCallback(
    (id: number): string => {
      const dept = departments.find((d) => d.id === id)
      return dept?.displayName || `Departamento ${id}`
    },
    [departments]
  )

  /**
   * Obtiene el nombre original (sin formatear) de un departamento por ID
   * @param id - ID del departamento
   * @returns Nombre original de la BD
   */
  const getDepartmentRawName = useCallback(
    (id: number): string => {
      const dept = departments.find((d) => d.id === id)
      return dept?.name || ''
    },
    [departments]
  )

  /**
   * Obtiene un departamento completo por ID
   * @param id - ID del departamento
   * @returns Objeto departamento formateado o null
   */
  const getDepartmentById = useCallback(
    (id: number): FormattedDepartment | null => {
      return departments.find((d) => d.id === id) || null
    },
    [departments]
  )

  /**
   * Busca departamentos por nombre (formateado o raw)
   * @param query - Texto a buscar
   * @returns Array de departamentos que coinciden
   */
  const searchDepartments = useCallback(
    (query: string): FormattedDepartment[] => {
      const lowerQuery = query.toLowerCase().trim()
      if (!lowerQuery) return departments

      return departments.filter(
        (dept) =>
          dept.displayName.toLowerCase().includes(lowerQuery) ||
          dept.name.toLowerCase().includes(lowerQuery)
      )
    },
    [departments]
  )

  return {
    /** Lista de departamentos con nombres formateados */
    departments,

    /** Estado de carga */
    loading,

    /** Mensaje de error si ocurre */
    error,

    /** Obtiene el nombre formateado por ID */
    getDepartmentName,

    /** Obtiene el nombre original (BD) por ID */
    getDepartmentRawName,

    /** Obtiene un departamento completo por ID */
    getDepartmentById,

    /** Busca departamentos por nombre */
    searchDepartments,

    /** Recarga la lista de departamentos */
    reloadDepartments: loadDepartments,

    /** Función para formatear nombres manualmente */
    formatDepartmentName,
  }
}

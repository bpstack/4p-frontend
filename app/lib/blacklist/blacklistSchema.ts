// app/blacklist/schemas/blacklistSchema.ts
/**
 * Validaciones Zod para el módulo Blacklist
 * Validación en cliente antes de enviar al servidor
 */

import { z } from 'zod'

// ========================================
// SCHEMA PRINCIPAL - CREAR/EDITAR
// ========================================

export const blacklistSchema = z
  .object({
    guest_name: z
      .string()
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(255, 'El nombre no puede exceder 255 caracteres')
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios')
      .trim(),

    document_type: z.enum(['DNI', 'PASSPORT', 'NIE', 'OTHER'], {
      errorMap: () => ({ message: 'Selecciona un tipo de documento válido' }),
    }),

    document_number: z
      .string()
      .min(5, 'El documento debe tener al menos 5 caracteres')
      .max(20, 'El documento no puede exceder 20 caracteres')
      .regex(
        /^[A-Z0-9-]+$/,
        'El documento solo puede contener letras mayúsculas, números y guiones'
      )
      .trim()
      .transform((val) => val.toUpperCase()),

    check_in_date: z.date({
      required_error: 'La fecha de entrada es obligatoria',
      invalid_type_error: 'Fecha de entrada inválida',
    }),

    check_out_date: z.date({
      required_error: 'La fecha de salida es obligatoria',
      invalid_type_error: 'Fecha de salida inválida',
    }),

    reason: z
      .string()
      .min(10, 'El motivo debe tener al menos 10 caracteres')
      .max(1000, 'El motivo no puede exceder 1000 caracteres')
      .trim(),

    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], {
      errorMap: () => ({ message: 'Selecciona un nivel de gravedad válido' }),
    }),

    images: z
      .array(z.instanceof(File))
      .max(5, 'No puedes subir más de 5 imágenes')
      .refine(
        (files) => files.every((file) => file.size <= 5 * 1024 * 1024),
        'Cada imagen debe pesar menos de 5MB'
      )
      .refine(
        (files) =>
          files.every((file) =>
            ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)
          ),
        'Solo se permiten imágenes JPG, PNG o WebP'
      )
      .optional()
      .default([]),

    comments: z
      .string()
      .min(10, 'Los comentarios deben tener al menos 10 caracteres')
      .max(2000, 'Los comentarios no pueden exceder 2000 caracteres')
      .trim(),
  })
  .refine((data) => data.check_out_date > data.check_in_date, {
    message: 'La fecha de salida debe ser posterior a la fecha de entrada',
    path: ['check_out_date'],
  })

// ========================================
// SCHEMA PARA EDICIÓN (sin validar imágenes)
// ========================================

export const blacklistEditSchema = z
  .object({
    guest_name: z
      .string()
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(255, 'El nombre no puede exceder 255 caracteres')
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios')
      .trim(),

    document_type: z.enum(['DNI', 'PASSPORT', 'NIE', 'OTHER']),

    document_number: z
      .string()
      .min(5, 'El documento debe tener al menos 5 caracteres')
      .max(20, 'El documento no puede exceder 20 caracteres')
      .regex(
        /^[A-Z0-9-]+$/,
        'El documento solo puede contener letras mayúsculas, números y guiones'
      )
      .trim()
      .transform((val) => val.toUpperCase()),

    check_in_date: z.date(),
    check_out_date: z.date(),

    reason: z
      .string()
      .min(10, 'El motivo debe tener al menos 10 caracteres')
      .max(1000, 'El motivo no puede exceder 1000 caracteres')
      .trim(),

    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),

    comments: z
      .string()
      .min(10, 'Los comentarios deben tener al menos 10 caracteres')
      .max(2000, 'Los comentarios no pueden exceder 2000 caracteres')
      .trim(),

    // Opcional: nuevas imágenes a agregar
    new_images: z
      .array(z.instanceof(File))
      .optional()
      .refine(
        (files) => !files || files.every((file) => file.size <= 5 * 1024 * 1024),
        'Cada imagen debe pesar menos de 5MB'
      )
      .refine(
        (files) =>
          !files ||
          files.every((file) =>
            ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)
          ),
        'Solo se permiten imágenes JPG, PNG o WebP'
      ),

    // URLs de imágenes existentes (no se validan)
    existing_images: z.array(z.string().url()).optional(),
  })
  .refine((data) => data.check_out_date > data.check_in_date, {
    message: 'La fecha de salida debe ser posterior a la fecha de entrada',
    path: ['check_out_date'],
  })

// ========================================
// SCHEMA DE FILTROS (para URL params)
// ========================================

export const filtersSchema = z.object({
  q: z.string().optional(),
  document: z.string().optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum(['ACTIVE', 'DELETED', 'ALL']).optional(),
  created_by: z.string().uuid().optional(),
  from_date: z.string().datetime().optional(),
  to_date: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

// ========================================
// TIPOS INFERIDOS
// ========================================

export type BlacklistSchemaType = z.infer<typeof blacklistSchema>
export type BlacklistEditSchemaType = z.infer<typeof blacklistEditSchema>
export type FiltersSchemaType = z.infer<typeof filtersSchema>

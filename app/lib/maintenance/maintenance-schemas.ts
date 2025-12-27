// app/lib/maintenance/maintenance-schemas.ts

import { z } from 'zod'

export const reportSchema = z
  .object({
    location_type: z.enum(['room', 'common_area', 'exterior', 'facilities', 'other'], {
      required_error: 'Tipo de ubicación requerido',
    }),
    location_description: z
      .string()
      .min(3, 'Mínimo 3 caracteres')
      .max(200, 'Máximo 200 caracteres'),
    title: z.string().min(3, 'Mínimo 3 caracteres').max(150, 'Máximo 150 caracteres'),
    description: z.string().min(10, 'Mínimo 10 caracteres'),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    room_number: z.string().max(10).optional(),
    room_out_of_service: z.boolean().optional(),
    assigned_to: z.string().uuid().optional(),
    assigned_type: z.enum(['internal', 'external']).optional(),
    external_company_name: z.string().max(150).optional(),
    external_contact: z.string().max(100).optional(),
  })
  .refine(
    (data) => {
      if (data.location_type === 'room' && !data.room_number) {
        return false
      }
      return true
    },
    {
      message: 'Número de habitación requerido para ubicación tipo "room"',
      path: ['room_number'],
    }
  )

export type ReportFormData = z.infer<typeof reportSchema>

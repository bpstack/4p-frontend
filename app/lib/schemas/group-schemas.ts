// app/lib/schemas/group-schemas.ts

import { z } from 'zod'
import { RoomType, RoomingStatus, BalanceStatus, GroupStatus } from '@/app/lib/groups'

// ========================================
// PAYMENT SCHEMAS
// ========================================

export const paymentSchema = z
  .object({
    payment_name: z
      .string()
      .min(1, 'El nombre del pago es requerido')
      .max(100, 'El nombre es demasiado largo'),

    payment_order: z
      .number()
      .int()
      .refine((val) => [1, 2, 3, 4, 5, 99].includes(val), {
        message: 'Selecciona un orden de pago válido',
      })
      .optional(),

    percentage: z
      .number()
      .min(0, 'El porcentaje no puede ser negativo')
      .max(100, 'El porcentaje no puede ser mayor a 100')
      .optional()
      .nullable(),

    amount: z.number().min(0, 'El monto no puede ser negativo').optional().nullable(),

    amount_paid: z.number().min(0, 'El monto pagado no puede ser negativo').optional().nullable(),

    due_date: z.string().min(1, 'La fecha de vencimiento es requerida'),

    status: z.enum(['pending', 'requested', 'partial', 'paid']),

    notes: z.string().max(500, 'Las notas son demasiado largas').optional(),
  })
  .refine(
    (data) => {
      // Debe haber al menos percentage O amount
      return data.percentage !== undefined || data.amount !== undefined
    },
    {
      message: 'Debes especificar el porcentaje o el monto',
      path: ['amount'],
    }
  )

export type PaymentFormData = z.infer<typeof paymentSchema>

// ========================================
// QUICK UPDATE SCHEMAS
// ========================================

export const updatePaymentStatusSchema = z.object({
  status: z.enum(['pending', 'requested', 'partial', 'paid']),
})

export const updateAmountPaidSchema = z.object({
  amount_paid: z.number().min(0, 'El monto no puede ser negativo'),
})

// ========================================
// CONTACT SCHEMAS
// ========================================

export const contactSchema = z.object({
  contact_name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre es demasiado largo'),

  contact_email: z.string().email('Email inválido').optional().or(z.literal('')),

  contact_phone: z.string().max(20, 'El teléfono es demasiado largo').optional(),

  is_primary: z.boolean().default(false),
})

export type ContactFormData = z.infer<typeof contactSchema>

// ========================================
// ROOM SCHEMAS
// ========================================

export const roomSchema = z.object({
  room_type: z.nativeEnum(RoomType, {
    errorMap: () => ({ message: 'Selecciona un tipo de habitación válido' }),
  }),

  quantity: z
    .number()
    .int('La cantidad debe ser un número entero')
    .min(1, 'La cantidad debe ser al menos 1')
    .max(999, 'La cantidad es demasiado alta'),

  guests_per_room: z
    .number()
    .int('El número de huéspedes debe ser un número entero')
    .min(1, 'Debe haber al menos 1 huésped por habitación')
    .max(10, 'Demasiados huéspedes por habitación'),

  notes: z.string().max(500, 'Las notas son demasiado largas').optional(),
})

export type RoomFormData = z.infer<typeof roomSchema>

// ========================================
// STATUS SCHEMAS
// ========================================

export const bookingSchema = z.object({
  confirmed: z.boolean(),
  date: z.string().optional(),
})

export const contractSchema = z.object({
  signed: z.boolean(),
  date: z.string().optional(),
})

export const roomingSchema = z
  .object({
    rooming_status: z.nativeEnum(RoomingStatus),
    rooming_requested_date: z.string().optional().or(z.literal('')),
    rooming_received_date: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      // Si hay fecha de recibido, debe haber fecha de solicitado
      if (data.rooming_received_date && data.rooming_received_date !== '') {
        return data.rooming_requested_date && data.rooming_requested_date !== ''
      }
      return true
    },
    {
      message: 'Debes especificar primero la fecha de solicitud',
      path: ['rooming_requested_date'],
    }
  )
  .refine(
    (data) => {
      // Si ambas fechas están presentes, received >= requested
      if (
        data.rooming_requested_date &&
        data.rooming_requested_date !== '' &&
        data.rooming_received_date &&
        data.rooming_received_date !== ''
      ) {
        const requested = new Date(data.rooming_requested_date)
        const received = new Date(data.rooming_received_date)
        return received >= requested
      }
      return true
    },
    {
      message: 'La fecha de recepción debe ser igual o posterior a la fecha de solicitud',
      path: ['rooming_received_date'],
    }
  )

export const balanceSchema = z.object({
  balance_status: z.nativeEnum(BalanceStatus),
  balance_requested_date: z.string().optional(),
  balance_paid_date: z.string().optional(),
})

export type BookingFormData = z.infer<typeof bookingSchema>
export type ContractFormData = z.infer<typeof contractSchema>
export type RoomingFormData = z.infer<typeof roomingSchema>
export type BalanceFormData = z.infer<typeof balanceSchema>

// ========================================
// GROUP SCHEMAS
// ========================================

export const groupSchema = z
  .object({
    name: z
      .string()
      .min(1, 'El nombre del grupo es requerido')
      .max(100, 'El nombre es demasiado largo'),

    agency: z
      .string()
      .max(100, 'El nombre de la agencia es demasiado largo')
      .optional()
      .or(z.literal('')),

    arrival_date: z.string().min(1, 'La fecha de llegada es requerida'),

    departure_date: z.string().min(1, 'La fecha de salida es requerida'),

    status: z.nativeEnum(GroupStatus, {
      errorMap: () => ({ message: 'Selecciona un estado válido' }),
    }),

    total_amount: z.number().min(0, 'El importe no puede ser negativo').optional(),

    currency: z.string().optional(), // ← Opcional ahora

    notes: z.string().max(2000, 'Las notas son demasiado largas').optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const arrival = new Date(data.arrival_date)
      return arrival >= today
    },
    {
      message: 'La fecha de llegada no puede ser en el pasado',
      path: ['arrival_date'],
    }
  )
  .refine(
    (data) => {
      const arrival = new Date(data.arrival_date)
      const departure = new Date(data.departure_date)
      return departure > arrival
    },
    {
      message: 'La fecha de salida debe ser posterior a la fecha de llegada',
      path: ['departure_date'],
    }
  )

export type GroupFormData = z.infer<typeof groupSchema>

// ========================================
// EDIT GROUP SCHEMAS
// ========================================

export const editGroupSchema = z
  .object({
    name: z
      .string()
      .min(1, 'El nombre del grupo es requerido')
      .max(100, 'El nombre es demasiado largo'),

    agency: z
      .string()
      .max(100, 'El nombre de la agencia es demasiado largo')
      .optional()
      .or(z.literal('')),

    arrival_date: z.string().min(1, 'La fecha de llegada es requerida'),

    departure_date: z.string().min(1, 'La fecha de salida es requerida'),

    status: z.nativeEnum(GroupStatus, {
      errorMap: () => ({ message: 'Selecciona un estado válido' }),
    }),

    total_amount: z.number().min(0, 'El importe no puede ser negativo').optional(),

    currency: z.string().optional(),

    notes: z.string().max(2000, 'Las notas son demasiado largas').optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      // ✅ Validar que arrival_date no sea en el pasado
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const arrival = new Date(data.arrival_date)
      return arrival >= today
    },
    {
      message: 'La fecha de llegada no puede ser en el pasado',
      path: ['arrival_date'],
    }
  )
  .refine(
    (data) => {
      // ✅ Validar que departure_date sea posterior a arrival_date
      const arrival = new Date(data.arrival_date)
      const departure = new Date(data.departure_date)
      return departure > arrival
    },
    {
      message: 'La fecha de salida debe ser posterior a la fecha de llegada',
      path: ['departure_date'],
    }
  )

export type EditGroupFormData = z.infer<typeof editGroupSchema>

// app/lib/backoffice/export-utils.ts
/**
 * Export utilities for Back Office invoices
 * Supports Excel (xlsx) and PDF exports
 */

import * as XLSX from 'xlsx'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import type { InvoiceWithDetails } from './types'
import { INVOICE_STATUS_LABELS, PAYMENT_METHOD_LABELS, formatCurrency } from './types'

/**
 * Format date for display in exports
 */
function formatDate(date: string | null): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Format number for Excel (raw number, not currency string)
 */
function formatNumber(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Export invoices to Excel file
 */
export async function exportToExcel(
  invoices: InvoiceWithDetails[],
  filename?: string
): Promise<void> {
  // Prepare data for Excel
  const data = invoices.map((inv) => ({
    Proveedor: inv.supplier_name,
    'N Factura': inv.invoice_number,
    'Fecha Factura': formatDate(inv.invoice_date),
    'Centro Coste': inv.cost_center || '-',
    Departamento: inv.department || '-',
    BI: formatNumber(Number(inv.amount_without_vat) || 0),
    'IVA %': inv.vat_percentage,
    'Importe Total': formatNumber(Number(inv.amount_with_vat) || 0),
    Estado: INVOICE_STATUS_LABELS[inv.status],
    'Forma Pago': PAYMENT_METHOD_LABELS[inv.payment_method],
    'Fecha Vencimiento': formatDate(inv.due_date),
    'Fecha Pago': formatDate(inv.paid_date),
    Notas: inv.notes || '',
  }))

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)

  // Set column widths
  ws['!cols'] = [
    { wch: 30 }, // Proveedor
    { wch: 20 }, // N Factura
    { wch: 12 }, // Fecha Factura
    { wch: 15 }, // Centro Coste
    { wch: 20 }, // Departamento
    { wch: 14 }, // Base Imponible
    { wch: 8 }, // IVA %
    { wch: 14 }, // Total con IVA
    { wch: 12 }, // Estado
    { wch: 15 }, // Forma Pago
    { wch: 14 }, // Fecha Vencimiento
    { wch: 12 }, // Fecha Pago
    { wch: 30 }, // Notas
  ]

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Facturas')

  // Add summary sheet
  const totalWithVat = invoices.reduce((sum, inv) => sum + (Number(inv.amount_with_vat) || 0), 0)
  const totalWithoutVat = invoices.reduce(
    (sum, inv) => sum + (Number(inv.amount_without_vat) || 0),
    0
  )
  const pendingCount = invoices.filter((inv) => inv.status === 'pending').length
  const validatedCount = invoices.filter((inv) => inv.status === 'validated').length

  const summaryData = [
    { Concepto: 'Total Facturas', Valor: invoices.length },
    { Concepto: 'Pendientes', Valor: pendingCount },
    { Concepto: 'Validadas', Valor: validatedCount },
    { Concepto: 'Total BI', Valor: formatNumber(totalWithoutVat) },
    { Concepto: 'Total Importe', Valor: formatNumber(totalWithVat) },
  ]

  const wsSummary = XLSX.utils.json_to_sheet(summaryData)
  wsSummary['!cols'] = [{ wch: 25 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen')

  // Generate filename
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const finalFilename = filename || `facturas_pendientes_${timestamp}.xlsx`

  // Download file
  XLSX.writeFile(wb, finalFilename)
}

/**
 * Export invoices to PDF file
 */
export async function exportToPdf(
  invoices: InvoiceWithDetails[],
  filename?: string
): Promise<void> {
  // Create PDF document
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // Page settings
  const pageWidth = 842 // A4 landscape width
  const pageHeight = 595 // A4 landscape height
  const margin = 30
  const lineHeight = 14
  const headerHeight = 20

  // Colors
  const headerBg = rgb(0.2, 0.4, 0.6)
  const headerText = rgb(1, 1, 1)
  const rowAlt = rgb(0.96, 0.96, 0.96)
  const textColor = rgb(0.1, 0.1, 0.1)

  // Column definitions - total width = 782 (842 - 60 margins)
  // Proveedor(140) + Factura(100) + Fecha(65) + Centro(130) + BI(75) + Total(85) + Estado(70) + Pago(85) = 750
  let xPos = margin
  const columns = [
    { label: 'Proveedor', x: xPos, width: 140 },
    { label: 'N Factura', x: (xPos += 140), width: 100 },
    { label: 'Fecha', x: (xPos += 100), width: 65 },
    { label: 'Centro Coste', x: (xPos += 65), width: 130 },
    { label: 'BI', x: (xPos += 130), width: 75 },
    { label: 'Importe Total', x: (xPos += 75), width: 85 },
    { label: 'Estado', x: (xPos += 85), width: 70 },
    { label: 'Pago', x: (xPos += 70), width: 85 },
  ]

  // Calculate totals (ensure numbers, not strings)
  const totalWithVat = invoices.reduce((sum, inv) => sum + (Number(inv.amount_with_vat) || 0), 0)
  const totalWithoutVat = invoices.reduce(
    (sum, inv) => sum + (Number(inv.amount_without_vat) || 0),
    0
  )

  // Create pages
  let currentPage = pdfDoc.addPage([pageWidth, pageHeight])
  let yPosition = pageHeight - margin

  // Draw title
  const title = 'Listado de Facturas Pendientes'
  const dateStr = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  currentPage.drawText(title, {
    x: margin,
    y: yPosition,
    size: 16,
    font: fontBold,
    color: textColor,
  })

  yPosition -= 20

  currentPage.drawText(`Fecha de exportacion: ${dateStr}`, {
    x: margin,
    y: yPosition,
    size: 10,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
  })

  currentPage.drawText(`Total: ${invoices.length} facturas`, {
    x: margin + 300,
    y: yPosition,
    size: 10,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
  })

  yPosition -= 30

  // Function to draw header
  const drawHeader = (page: typeof currentPage, y: number) => {
    // Header background
    page.drawRectangle({
      x: margin,
      y: y - headerHeight + 5,
      width: pageWidth - margin * 2,
      height: headerHeight,
      color: headerBg,
    })

    // Header text
    for (const col of columns) {
      page.drawText(col.label, {
        x: col.x + 3,
        y: y - 10,
        size: 9,
        font: fontBold,
        color: headerText,
      })
    }

    return y - headerHeight - 5
  }

  // Function to truncate text based on approximate character width
  const truncateText = (text: string, maxWidth: number, fontSize: number): string => {
    // Helvetica average char width is ~0.55 of font size
    const avgCharWidth = fontSize * 0.55
    const maxChars = Math.floor(maxWidth / avgCharWidth)
    if (text.length <= maxChars) return text
    return text.substring(0, maxChars - 2) + '..'
  }

  // Draw initial header
  yPosition = drawHeader(currentPage, yPosition)

  // Draw rows
  for (let i = 0; i < invoices.length; i++) {
    const inv = invoices[i]

    // Check if we need a new page
    if (yPosition < margin + 40) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight])
      yPosition = pageHeight - margin
      yPosition = drawHeader(currentPage, yPosition)
    }

    // Alternate row background
    if (i % 2 === 1) {
      currentPage.drawRectangle({
        x: margin,
        y: yPosition - lineHeight + 3,
        width: pageWidth - margin * 2,
        height: lineHeight,
        color: rowAlt,
      })
    }

    // Draw row data
    const rowData = [
      truncateText(inv.supplier_name || '', columns[0].width - 5, 8),
      truncateText(inv.invoice_number || '', columns[1].width - 5, 8),
      formatDate(inv.invoice_date),
      truncateText(inv.cost_center || '-', columns[3].width - 5, 8),
      formatCurrency(Number(inv.amount_without_vat) || 0),
      formatCurrency(Number(inv.amount_with_vat) || 0),
      INVOICE_STATUS_LABELS[inv.status],
      PAYMENT_METHOD_LABELS[inv.payment_method],
    ]

    for (let j = 0; j < columns.length; j++) {
      currentPage.drawText(rowData[j], {
        x: columns[j].x + 3,
        y: yPosition - 8,
        size: 8,
        font: font,
        color: textColor,
      })
    }

    yPosition -= lineHeight
  }

  // Draw totals
  yPosition -= 10

  // Totals background
  currentPage.drawRectangle({
    x: margin,
    y: yPosition - lineHeight + 3,
    width: pageWidth - margin * 2,
    height: lineHeight + 5,
    color: rgb(0.9, 0.95, 1),
  })

  currentPage.drawText('TOTALES:', {
    x: margin + 5,
    y: yPosition - 8,
    size: 9,
    font: fontBold,
    color: textColor,
  })

  currentPage.drawText(formatCurrency(totalWithoutVat), {
    x: columns[4].x + 3,
    y: yPosition - 8,
    size: 9,
    font: fontBold,
    color: textColor,
  })

  currentPage.drawText(formatCurrency(totalWithVat), {
    x: columns[5].x + 3,
    y: yPosition - 8,
    size: 9,
    font: fontBold,
    color: textColor,
  })

  // Generate filename
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const finalFilename = filename || `facturas_pendientes_${timestamp}.pdf`

  // Save and download
  const pdfBytes = await pdfDoc.save()
  // Create ArrayBuffer copy to ensure TypeScript compatibility with Blob
  const arrayBuffer = pdfBytes.buffer.slice(
    pdfBytes.byteOffset,
    pdfBytes.byteOffset + pdfBytes.byteLength
  ) as ArrayBuffer
  const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = finalFilename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

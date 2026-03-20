// app/lib/scheduling/export-pdf.ts
// Export schedule grid to PDF format - Only the schedule matrix with employees and full month

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import type { SchedulingMonthFull, SchedulingDay } from './types'

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const DAY_NAMES: Record<string, string> = {
  L: 'L',
  M: 'M',
  X: 'X',
  J: 'J',
  V: 'V',
  S: 'S',
  D: 'D',
}

// Shift colors for PDF - Matching Tailwind colors from shift-styles.ts (light mode)
// Format: bg is {color}-100, text is {color}-800 (or {color}-600 for gray)
const SHIFT_COLORS: Record<
  string,
  { bg: [number, number, number]; text: [number, number, number] }
> = {
  // Work shifts
  M: { bg: [0.86, 0.94, 0.83], text: [0.13, 0.39, 0.13] }, // green-100, green-800
  T: { bg: [0.86, 0.92, 0.98], text: [0.12, 0.31, 0.55] }, // blue-100, blue-800
  N: { bg: [1.0, 0.93, 0.84], text: [0.58, 0.27, 0.0] }, // orange-100, orange-800
  P: { bg: [0.88, 0.87, 0.98], text: [0.24, 0.19, 0.52] }, // indigo-100, indigo-800
  PI: { bg: [0.99, 0.98, 0.77], text: [0.51, 0.4, 0.05] }, // yellow-100, yellow-800

  // Non-work shifts (absences, days off)
  B: { bg: [0.95, 0.9, 0.98], text: [0.42, 0.13, 0.53] }, // purple-100, purple-800
  V: { bg: [0.99, 0.89, 0.89], text: [0.6, 0.11, 0.11] }, // red-100, red-800
  L: { bg: [0.95, 0.96, 0.96], text: [0.29, 0.33, 0.38] }, // gray-100, gray-600
  FO: { bg: [0.93, 0.98, 0.82], text: [0.26, 0.43, 0.04] }, // lime-100, lime-800
  IT: { bg: [0.99, 0.95, 0.82], text: [0.57, 0.35, 0.01] }, // amber-100, amber-800
  E: { bg: [0.99, 0.88, 0.93], text: [0.6, 0.12, 0.39] }, // pink-100, pink-800
  A: { bg: [1.0, 0.89, 0.89], text: [0.62, 0.12, 0.17] }, // rose-100, rose-800
}

const DEFAULT_SHIFT_COLOR = {
  bg: [0.95, 0.95, 0.95] as [number, number, number],
  text: [0.3, 0.3, 0.3] as [number, number, number],
}

/**
 * Export schedule to PDF file - Only the matrix with employees and full month
 */
export async function downloadSchedulePdf(monthData: SchedulingMonthFull): Promise<void> {
  const { year, month, days, employees } = monthData
  const monthName = MONTH_NAMES[month - 1]

  // Create PDF document - A4 Landscape for better fit
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // Page settings - A4 Landscape
  const pageWidth = 842
  const pageHeight = 595
  const margin = 25
  const titleHeight = 40

  // Calculate cell dimensions based on number of days
  const nameColWidth = 110
  const availableWidth = pageWidth - margin * 2 - nameColWidth
  const cellWidth = Math.floor(availableWidth / days.length)
  const cellHeight = 16
  const headerHeight = 28

  // Calculate how many employees fit per page
  const availableHeight = pageHeight - margin * 2 - titleHeight - headerHeight
  const employeesPerPage = Math.floor(availableHeight / cellHeight)

  // Colors
  const headerBg = rgb(0.15, 0.3, 0.5)
  const headerText = rgb(1, 1, 1)
  const borderColor = rgb(0.8, 0.8, 0.8)
  const textColor = rgb(0.2, 0.2, 0.2)
  const weekendBg = rgb(0.96, 0.96, 0.98)

  // Split employees into pages
  const totalPages = Math.ceil(employees.length / employeesPerPage)

  for (let pageNum = 0; pageNum < totalPages; pageNum++) {
    const page = pdfDoc.addPage([pageWidth, pageHeight])
    let yPos = pageHeight - margin

    // Title
    const title = `Horarios ${monthName} ${year}`
    page.drawText(title, {
      x: margin,
      y: yPos - 12,
      size: 14,
      font: fontBold,
      color: textColor,
    })

    if (totalPages > 1) {
      page.drawText(`Página ${pageNum + 1} de ${totalPages}`, {
        x: pageWidth - margin - 80,
        y: yPos - 12,
        size: 9,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      })
    }

    yPos -= titleHeight

    // Header row - Employee name column
    page.drawRectangle({
      x: margin,
      y: yPos - headerHeight,
      width: nameColWidth,
      height: headerHeight,
      color: headerBg,
    })

    page.drawText('Empleado', {
      x: margin + 5,
      y: yPos - headerHeight / 2 - 4,
      size: 9,
      font: fontBold,
      color: headerText,
    })

    // Header row - Day columns
    let xPos = margin + nameColWidth
    days.forEach((day: SchedulingDay) => {
      const isWeekend = day.dayOfWeek === 'S' || day.dayOfWeek === 'D'

      page.drawRectangle({
        x: xPos,
        y: yPos - headerHeight,
        width: cellWidth,
        height: headerHeight,
        color: isWeekend ? rgb(0.12, 0.25, 0.42) : headerBg,
      })

      // Day of week
      const dayName = DAY_NAMES[day.dayOfWeek] || day.dayOfWeek
      page.drawText(dayName, {
        x: xPos + cellWidth / 2 - 3,
        y: yPos - 10,
        size: 7,
        font: font,
        color: headerText,
      })

      // Day number
      page.drawText(String(day.dayNumber), {
        x: xPos + cellWidth / 2 - (day.dayNumber >= 10 ? 5 : 2),
        y: yPos - 22,
        size: 9,
        font: fontBold,
        color: headerText,
      })

      xPos += cellWidth
    })

    yPos -= headerHeight

    // Employee rows for this page
    const startIdx = pageNum * employeesPerPage
    const endIdx = Math.min(startIdx + employeesPerPage, employees.length)
    const pageEmployees = employees.slice(startIdx, endIdx)

    pageEmployees.forEach((employee, rowIdx) => {
      const rowY = yPos - (rowIdx + 1) * cellHeight
      const isEvenRow = rowIdx % 2 === 0

      // Employee name cell
      page.drawRectangle({
        x: margin,
        y: rowY,
        width: nameColWidth,
        height: cellHeight,
        color: isEvenRow ? rgb(0.98, 0.98, 0.98) : rgb(1, 1, 1),
        borderColor: borderColor,
        borderWidth: 0.5,
      })

      // Truncate name if too long
      let displayName = employee.name
      if (displayName.length > 18) {
        displayName = displayName.substring(0, 16) + '..'
      }

      page.drawText(displayName, {
        x: margin + 4,
        y: rowY + 4,
        size: 8,
        font: font,
        color: textColor,
      })

      // Day cells
      let cellX = margin + nameColWidth
      days.forEach((day: SchedulingDay) => {
        const isWeekend = day.dayOfWeek === 'S' || day.dayOfWeek === 'D'
        const assignment = employee.assignments[day.dayNumber]
        const shiftCode = assignment?.shiftCode || ''

        // Get shift color
        const shiftColor = SHIFT_COLORS[shiftCode] || DEFAULT_SHIFT_COLOR

        // Cell background
        let bgColor = isEvenRow ? rgb(0.98, 0.98, 0.98) : rgb(1, 1, 1)
        if (isWeekend && !shiftCode) {
          bgColor = weekendBg
        } else if (shiftCode) {
          bgColor = rgb(shiftColor.bg[0], shiftColor.bg[1], shiftColor.bg[2])
        }

        page.drawRectangle({
          x: cellX,
          y: rowY,
          width: cellWidth,
          height: cellHeight,
          color: bgColor,
          borderColor: borderColor,
          borderWidth: 0.5,
        })

        // Shift code text
        if (shiftCode) {
          const textX = cellX + cellWidth / 2 - (shiftCode.length > 1 ? 5 : 2)
          page.drawText(shiftCode, {
            x: textX,
            y: rowY + 4,
            size: 8,
            font: fontBold,
            color: rgb(shiftColor.text[0], shiftColor.text[1], shiftColor.text[2]),
          })
        }

        cellX += cellWidth
      })
    })
  }

  // Generate filename and download
  const filename = `horarios-${monthName.toLowerCase()}-${year}.pdf`

  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

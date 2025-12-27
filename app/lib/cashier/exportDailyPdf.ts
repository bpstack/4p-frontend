// app/lib/cashier/exportDailyPdf.ts
import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from 'pdf-lib'
import type {
  CashierDaily,
  CashierShift,
  CashierDenomination,
  CashierPayment,
  CashierVoucher,
} from './types'

interface ExportLabels {
  title: string
  date: string
  status: string
  open: string
  closed: string
  grandTotal: string
  cash: string
  electronic: string
  card: string
  bacs: string
  webPayment: string
  transfer: string
  other: string
  activeVouchers: string
  shift: string
  shifts: {
    night: string
    morning: string
    afternoon: string
    closing: string
  }
  initialFund: string
  income: string
  cashCounted: string
  difference: string
  users: string
  denominations: string
  payments: string
  vouchers: string
  noData: string
  generatedAt: string
}

const PAGE_WIDTH = 595 // A4
const PAGE_HEIGHT = 842
const MARGIN = 40
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

const COLORS = {
  black: rgb(0, 0, 0),
  darkGray: rgb(0.2, 0.2, 0.2),
  gray: rgb(0.4, 0.4, 0.4),
  lightGray: rgb(0.6, 0.6, 0.6),
  lineGray: rgb(0.85, 0.85, 0.85),
  green: rgb(0.1, 0.5, 0.2),
  blue: rgb(0.1, 0.3, 0.6),
  red: rgb(0.7, 0.1, 0.1),
  orange: rgb(0.8, 0.4, 0.0),
}

function drawShiftPage(
  page: PDFPage,
  shift: CashierShift,
  selectedDate: string,
  labels: ExportLabels,
  font: PDFFont,
  fontBold: PDFFont,
  pageInfo: string = '1/1'
) {
  let y = PAGE_HEIGHT - MARGIN

  // Helper functions
  const text = (
    str: string,
    x: number,
    yPos: number,
    opts: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb> } = {}
  ) => {
    page.drawText(str, {
      x,
      y: yPos,
      size: opts.size || 10,
      font: opts.font || font,
      color: opts.color || COLORS.black,
    })
  }

  const line = (yPos: number, thickness = 0.5) => {
    page.drawLine({
      start: { x: MARGIN, y: yPos },
      end: { x: PAGE_WIDTH - MARGIN, y: yPos },
      thickness,
      color: COLORS.lineGray,
    })
  }

  const box = (
    x: number,
    yPos: number,
    width: number,
    height: number,
    borderColor = COLORS.lineGray
  ) => {
    page.drawRectangle({
      x,
      y: yPos,
      width,
      height,
      borderColor,
      borderWidth: 1,
    })
  }

  // ═══════════════════════════════════════════════════════
  // HEADER
  // ═══════════════════════════════════════════════════════
  const shiftName =
    labels.shifts[shift.shift_type as keyof typeof labels.shifts] || shift.shift_type

  text(shiftName.toUpperCase(), MARGIN, y, { size: 20, font: fontBold })

  const statusText = shift.status === 'closed' ? labels.closed : labels.open
  const statusColor = shift.status === 'closed' ? COLORS.green : COLORS.blue
  text(statusText.toUpperCase(), PAGE_WIDTH - MARGIN - 60, y, {
    size: 12,
    font: fontBold,
    color: statusColor,
  })

  y -= 25
  text(`${labels.date}: ${selectedDate}`, MARGIN, y, { size: 11, color: COLORS.gray })

  // Users
  if (shift.users && shift.users.length > 0) {
    const userNames = shift.users
      .map((u) => `${u.username}${u.is_primary ? ' (P)' : ''}`)
      .join(', ')
    text(`${labels.users}: ${userNames}`, MARGIN + 180, y, { size: 11, color: COLORS.gray })
  }

  y -= 15
  line(y, 1)
  y -= 25

  // ═══════════════════════════════════════════════════════
  // MAIN METRICS (Big boxes)
  // ═══════════════════════════════════════════════════════
  const boxWidth = (CONTENT_WIDTH - 30) / 4
  const boxHeight = 55
  const metrics = [
    { label: labels.initialFund, value: parseFloat(shift.initial_fund || '0'), color: COLORS.gray },
    { label: labels.income, value: parseFloat(shift.income || '0'), color: COLORS.green },
    { label: labels.cashCounted, value: parseFloat(shift.cash_counted || '0'), color: COLORS.blue },
    {
      label: labels.difference,
      value: parseFloat(shift.difference || '0'),
      color: parseFloat(shift.difference || '0') === 0 ? COLORS.green : COLORS.red,
    },
  ]

  metrics.forEach((metric, i) => {
    const boxX = MARGIN + i * (boxWidth + 10)
    box(boxX, y - boxHeight, boxWidth, boxHeight)
    text(metric.label, boxX + 8, y - 18, { size: 9, color: COLORS.gray })
    text(`${metric.value.toFixed(2)} €`, boxX + 8, y - 40, {
      size: 16,
      font: fontBold,
      color: metric.color,
    })
  })

  y -= boxHeight + 25

  // ═══════════════════════════════════════════════════════
  // TWO COLUMNS: Denominations | Payments
  // ═══════════════════════════════════════════════════════
  const colWidth = (CONTENT_WIDTH - 20) / 2
  const colLeftX = MARGIN
  const colRightX = MARGIN + colWidth + 20
  const sectionStartY = y

  // --- LEFT COLUMN: DENOMINATIONS ---
  text(labels.denominations.toUpperCase(), colLeftX, y, {
    size: 11,
    font: fontBold,
    color: COLORS.darkGray,
  })
  y -= 5
  line(y)
  y -= 15

  if (shift.denominations && shift.denominations.length > 0) {
    // Group by bills and coins
    const bills = shift.denominations.filter((d) => parseFloat(d.denomination) >= 5)
    const coins = shift.denominations.filter((d) => parseFloat(d.denomination) < 5)

    const drawDenom = (denom: CashierDenomination) => {
      const val = parseFloat(denom.denomination)
      const label = val >= 1 ? `${val.toFixed(0)} €` : `${(val * 100).toFixed(0)} ¢`
      text(label, colLeftX + 5, y, { size: 10 })
      text(`x ${denom.quantity}`, colLeftX + 50, y, { size: 10, color: COLORS.gray })
      text(`${parseFloat(denom.total).toFixed(2)} €`, colLeftX + colWidth - 60, y, {
        size: 10,
        font: fontBold,
      })
      y -= 14
    }

    if (bills.length > 0) {
      text('Billetes', colLeftX, y, { size: 9, font: fontBold, color: COLORS.blue })
      y -= 14
      bills.forEach(drawDenom)
      y -= 5
    }

    if (coins.length > 0) {
      text('Monedas', colLeftX, y, { size: 9, font: fontBold, color: COLORS.blue })
      y -= 14
      coins.forEach(drawDenom)
    }

    // Total
    y -= 8
    line(y)
    y -= 15
    text('TOTAL EFECTIVO', colLeftX + 5, y, { size: 10, font: fontBold })
    const totalCash = shift.denominations.reduce((sum, d) => sum + parseFloat(d.total), 0)
    text(`${totalCash.toFixed(2)} €`, colLeftX + colWidth - 60, y, {
      size: 12,
      font: fontBold,
      color: COLORS.green,
    })
  } else {
    text('Sin conteo registrado', colLeftX + 5, y, { size: 10, color: COLORS.lightGray })
  }

  // --- RIGHT COLUMN: PAYMENTS ---
  let yRight = sectionStartY
  text(labels.payments.toUpperCase(), colRightX, yRight, {
    size: 11,
    font: fontBold,
    color: COLORS.darkGray,
  })
  yRight -= 5
  page.drawLine({
    start: { x: colRightX, y: yRight },
    end: { x: PAGE_WIDTH - MARGIN, y: yRight },
    thickness: 0.5,
    color: COLORS.lineGray,
  })
  yRight -= 15

  if (shift.payments && shift.payments.length > 0) {
    shift.payments.forEach((payment: CashierPayment) => {
      text(`- ${payment.payment_method_name}`, colRightX + 5, yRight, { size: 10 })
      text(`${parseFloat(payment.amount).toFixed(2)} €`, colRightX + colWidth - 60, yRight, {
        size: 10,
        font: fontBold,
      })
      yRight -= 16
    })

    // Total
    yRight -= 8
    page.drawLine({
      start: { x: colRightX, y: yRight },
      end: { x: PAGE_WIDTH - MARGIN, y: yRight },
      thickness: 0.5,
      color: COLORS.lineGray,
    })
    yRight -= 15
    text('TOTAL ELECTRÓNICO', colRightX + 5, yRight, { size: 10, font: fontBold })
    const totalPayments = shift.payments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
    text(`${totalPayments.toFixed(2)} €`, colRightX + colWidth - 60, yRight, {
      size: 12,
      font: fontBold,
      color: COLORS.blue,
    })
  } else {
    text('Sin pagos registrados', colRightX + 5, yRight, { size: 10, color: COLORS.lightGray })
  }

  // Use the lower Y position
  y = Math.min(y, yRight) - 30

  // ═══════════════════════════════════════════════════════
  // VOUCHERS SECTION
  // ═══════════════════════════════════════════════════════
  text(labels.vouchers.toUpperCase(), MARGIN, y, {
    size: 11,
    font: fontBold,
    color: COLORS.darkGray,
  })
  y -= 5
  line(y)
  y -= 15

  if (shift.vouchers && shift.vouchers.length > 0) {
    shift.vouchers.forEach((voucher: CashierVoucher, idx: number) => {
      const statusCol =
        voucher.status === 'justified'
          ? COLORS.green
          : voucher.status === 'cancelled'
            ? COLORS.red
            : COLORS.orange

      text(
        `${idx + 1}. ${voucher.reason.substring(0, 50)}${voucher.reason.length > 50 ? '...' : ''}`,
        MARGIN + 5,
        y,
        { size: 9 }
      )
      text(`${parseFloat(voucher.amount).toFixed(2)} EUR`, MARGIN + 350, y, {
        size: 10,
        font: fontBold,
      })
      text(`[${voucher.status}]`, MARGIN + 430, y, { size: 8, color: statusCol })
      y -= 14
    })

    // Total vouchers
    y -= 5
    const totalVouchers = shift.vouchers.reduce((sum, v) => sum + parseFloat(v.amount), 0)
    text(`Total: ${shift.vouchers.length} vale(s) = ${totalVouchers.toFixed(2)} €`, MARGIN + 5, y, {
      size: 10,
      font: fontBold,
      color: COLORS.orange,
    })
  } else {
    text('Sin vales en este turno', MARGIN + 5, y, { size: 10, color: COLORS.lightGray })
  }

  // ═══════════════════════════════════════════════════════
  // GRAND TOTAL BOX (bottom)
  // ═══════════════════════════════════════════════════════
  const grandTotalBoxY = MARGIN + 60
  const grandTotalBoxHeight = 50

  page.drawRectangle({
    x: MARGIN,
    y: grandTotalBoxY,
    width: CONTENT_WIDTH,
    height: grandTotalBoxHeight,
    color: rgb(0.95, 0.95, 0.98),
    borderColor: COLORS.blue,
    borderWidth: 1,
  })

  const grandTotal = parseFloat(shift.grand_total || '0')
  text(labels.grandTotal.toUpperCase(), MARGIN + 15, grandTotalBoxY + 32, {
    size: 12,
    font: fontBold,
    color: COLORS.darkGray,
  })
  text(`${grandTotal.toFixed(2)} €`, MARGIN + CONTENT_WIDTH - 120, grandTotalBoxY + 25, {
    size: 22,
    font: fontBold,
    color: COLORS.blue,
  })

  // Breakdown
  const cashTotal = parseFloat(shift.cash_counted || '0')
  const paymentsTotal = shift.payments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0
  text(
    `Efectivo: ${cashTotal.toFixed(2)} € + Electrónico: ${paymentsTotal.toFixed(2)} €`,
    MARGIN + 15,
    grandTotalBoxY + 12,
    { size: 9, color: COLORS.gray }
  )

  // ═══════════════════════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════════════════════
  const now = new Date().toLocaleString()
  text(`${labels.generatedAt}: ${now}`, MARGIN, MARGIN + 15, { size: 8, color: COLORS.lightGray })
  text(pageInfo, PAGE_WIDTH - MARGIN - 30, MARGIN + 15, { size: 8, color: COLORS.lightGray })
}

function drawDaySummaryPage(
  page: PDFPage,
  daily: CashierDaily,
  selectedDate: string,
  labels: ExportLabels,
  font: PDFFont,
  fontBold: PDFFont,
  pageInfo: string = '2/2'
) {
  let y = PAGE_HEIGHT - MARGIN

  // Helper functions
  const text = (
    str: string,
    x: number,
    yPos: number,
    opts: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb> } = {}
  ) => {
    page.drawText(str, {
      x,
      y: yPos,
      size: opts.size || 10,
      font: opts.font || font,
      color: opts.color || COLORS.black,
    })
  }

  const line = (yPos: number, thickness = 0.5) => {
    page.drawLine({
      start: { x: MARGIN, y: yPos },
      end: { x: PAGE_WIDTH - MARGIN, y: yPos },
      thickness,
      color: COLORS.lineGray,
    })
  }

  const box = (
    x: number,
    yPos: number,
    width: number,
    height: number,
    borderColor = COLORS.lineGray
  ) => {
    page.drawRectangle({
      x,
      y: yPos,
      width,
      height,
      borderColor,
      borderWidth: 1,
    })
  }

  // ═══════════════════════════════════════════════════════
  // HEADER - DAY SUMMARY
  // ═══════════════════════════════════════════════════════
  text('RESUMEN DEL DIA', MARGIN, y, { size: 20, font: fontBold })

  const statusText = daily.status === 'closed' ? labels.closed : labels.open
  const statusColor = daily.status === 'closed' ? COLORS.green : COLORS.blue
  text(statusText.toUpperCase(), PAGE_WIDTH - MARGIN - 60, y, {
    size: 12,
    font: fontBold,
    color: statusColor,
  })

  y -= 25
  text(`${labels.date}: ${selectedDate}`, MARGIN, y, { size: 11, color: COLORS.gray })

  y -= 15
  line(y, 1)
  y -= 30

  // ═══════════════════════════════════════════════════════
  // MAIN TOTALS (Big boxes)
  // ═══════════════════════════════════════════════════════
  const boxWidth = (CONTENT_WIDTH - 20) / 3
  const boxHeight = 60

  const totalCash = parseFloat(daily.total_cash || '0')
  const totalCard = parseFloat(daily.total_card || '0')
  const totalBacs = parseFloat(daily.total_bacs || '0')
  const totalWebPayment = parseFloat(daily.total_web_payment || '0')
  const totalTransfer = parseFloat(daily.total_transfer || '0')
  const totalOther = parseFloat(daily.total_other || '0')
  const grandTotal = parseFloat(daily.grand_total || '0')
  const electronicTotal = totalCard + totalBacs + totalWebPayment + totalTransfer + totalOther

  const mainMetrics = [
    { label: labels.grandTotal, value: grandTotal, color: COLORS.blue },
    { label: labels.cash, value: totalCash, color: COLORS.green },
    { label: labels.electronic, value: electronicTotal, color: COLORS.blue },
  ]

  mainMetrics.forEach((metric, i) => {
    const boxX = MARGIN + i * (boxWidth + 10)
    box(boxX, y - boxHeight, boxWidth, boxHeight)
    text(metric.label, boxX + 10, y - 20, { size: 10, color: COLORS.gray })
    text(`${metric.value.toFixed(2)} EUR`, boxX + 10, y - 45, {
      size: 18,
      font: fontBold,
      color: metric.color,
    })
  })

  y -= boxHeight + 30

  // ═══════════════════════════════════════════════════════
  // PAYMENT METHODS BREAKDOWN
  // ═══════════════════════════════════════════════════════
  text('DESGLOSE POR METODO DE PAGO', MARGIN, y, {
    size: 11,
    font: fontBold,
    color: COLORS.darkGray,
  })
  y -= 5
  line(y)
  y -= 20

  const paymentMethods = [
    { label: labels.cash, value: totalCash },
    { label: labels.card, value: totalCard },
    { label: labels.bacs, value: totalBacs },
    { label: labels.webPayment, value: totalWebPayment },
    { label: labels.transfer, value: totalTransfer },
    { label: labels.other, value: totalOther },
  ]

  paymentMethods.forEach((method) => {
    if (method.value > 0) {
      text(method.label, MARGIN + 10, y, { size: 10 })
      text(`${method.value.toFixed(2)} EUR`, MARGIN + 200, y, { size: 10, font: fontBold })
      y -= 18
    }
  })

  y -= 10
  line(y)
  y -= 15
  text('TOTAL', MARGIN + 10, y, { size: 11, font: fontBold })
  text(`${grandTotal.toFixed(2)} EUR`, MARGIN + 200, y, {
    size: 11,
    font: fontBold,
    color: COLORS.blue,
  })

  y -= 40

  // ═══════════════════════════════════════════════════════
  // SHIFTS SUMMARY
  // ═══════════════════════════════════════════════════════
  text('TURNOS DEL DIA', MARGIN, y, {
    size: 11,
    font: fontBold,
    color: COLORS.darkGray,
  })
  y -= 5
  line(y)
  y -= 20

  const shiftOrder = ['night', 'morning', 'afternoon', 'closing']
  const shiftNames: Record<string, string> = {
    night: labels.shifts.night,
    morning: labels.shifts.morning,
    afternoon: labels.shifts.afternoon,
    closing: labels.shifts.closing,
  }

  // Table header
  text('Turno', MARGIN + 10, y, { size: 9, font: fontBold, color: COLORS.gray })
  text('Estado', MARGIN + 120, y, { size: 9, font: fontBold, color: COLORS.gray })
  text('Efectivo', MARGIN + 200, y, { size: 9, font: fontBold, color: COLORS.gray })
  text('Electronicos', MARGIN + 290, y, { size: 9, font: fontBold, color: COLORS.gray })
  text('Total', MARGIN + 400, y, { size: 9, font: fontBold, color: COLORS.gray })
  y -= 15

  shiftOrder.forEach((shiftType) => {
    const shift = daily.shifts?.find((s) => s.shift_type === shiftType)
    const shiftName = shiftNames[shiftType] || shiftType

    text(shiftName, MARGIN + 10, y, { size: 10 })

    if (shift) {
      const shiftStatus = shift.status === 'closed' ? labels.closed : labels.open
      const shiftStatusColor = shift.status === 'closed' ? COLORS.green : COLORS.blue
      text(shiftStatus, MARGIN + 120, y, { size: 9, color: shiftStatusColor })

      const shiftCash = parseFloat(shift.cash_counted || '0')
      const shiftElectronic = shift.payments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0
      const shiftTotal = parseFloat(shift.grand_total || '0')

      text(`${shiftCash.toFixed(2)}`, MARGIN + 200, y, { size: 10 })
      text(`${shiftElectronic.toFixed(2)}`, MARGIN + 290, y, { size: 10 })
      text(`${shiftTotal.toFixed(2)}`, MARGIN + 400, y, { size: 10, font: fontBold })
    } else {
      text('No creado', MARGIN + 120, y, { size: 9, color: COLORS.lightGray })
      text('-', MARGIN + 200, y, { size: 10, color: COLORS.lightGray })
      text('-', MARGIN + 290, y, { size: 10, color: COLORS.lightGray })
      text('-', MARGIN + 400, y, { size: 10, color: COLORS.lightGray })
    }

    y -= 18
  })

  // ═══════════════════════════════════════════════════════
  // GRAND TOTAL BOX (bottom)
  // ═══════════════════════════════════════════════════════
  const grandTotalBoxY = MARGIN + 60
  const grandTotalBoxHeight = 50

  page.drawRectangle({
    x: MARGIN,
    y: grandTotalBoxY,
    width: CONTENT_WIDTH,
    height: grandTotalBoxHeight,
    color: rgb(0.95, 0.95, 0.98),
    borderColor: COLORS.blue,
    borderWidth: 1,
  })

  text('GRAN TOTAL DEL DIA', MARGIN + 15, grandTotalBoxY + 32, {
    size: 12,
    font: fontBold,
    color: COLORS.darkGray,
  })
  text(`${grandTotal.toFixed(2)} EUR`, MARGIN + CONTENT_WIDTH - 140, grandTotalBoxY + 25, {
    size: 22,
    font: fontBold,
    color: COLORS.blue,
  })

  text(
    `Efectivo: ${totalCash.toFixed(2)} EUR + Electronicos: ${electronicTotal.toFixed(2)} EUR`,
    MARGIN + 15,
    grandTotalBoxY + 12,
    { size: 9, color: COLORS.gray }
  )

  // ═══════════════════════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════════════════════
  const now = new Date().toLocaleString()
  text(`${labels.generatedAt}: ${now}`, MARGIN, MARGIN + 15, { size: 8, color: COLORS.lightGray })
  text(pageInfo, PAGE_WIDTH - MARGIN - 30, MARGIN + 15, { size: 8, color: COLORS.lightGray })
}

export async function exportDailyToPdf(
  daily: CashierDaily,
  selectedDate: string,
  labels: ExportLabels,
  shiftType?: string
): Promise<void> {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // Find the specific shift to export
  const shiftToExport = shiftType ? daily.shifts?.find((s) => s.shift_type === shiftType) : null

  if (shiftType && !shiftToExport) {
    // Shift type specified but not found - show no data message
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    page.drawText(labels.noData, {
      x: MARGIN,
      y: PAGE_HEIGHT / 2,
      size: 16,
      font: fontBold,
      color: COLORS.gray,
    })
  } else if (shiftToExport) {
    // Check if it's the closing shift - add day summary as second page
    const isClosingShift = shiftType === 'closing'
    const pageInfo = isClosingShift ? '1/2' : '1/1'

    // Export the shift page
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    drawShiftPage(page, shiftToExport, selectedDate, labels, font, fontBold, pageInfo)

    // If closing shift, add day summary page
    if (isClosingShift) {
      const summaryPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
      drawDaySummaryPage(summaryPage, daily, selectedDate, labels, font, fontBold, '2/2')
    }
  } else {
    // No shiftType specified - this shouldn't happen now, but fallback to no data
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    page.drawText(labels.noData, {
      x: MARGIN,
      y: PAGE_HEIGHT / 2,
      size: 16,
      font: fontBold,
      color: COLORS.gray,
    })
  }

  // Save and download
  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `cashier-${selectedDate}-${shiftType || 'shift'}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

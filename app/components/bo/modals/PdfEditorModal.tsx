// app/components/bo/modals/PdfEditorModal.tsx
/**
 * Editor de PDF para validación de facturas
 * Permite añadir sellos, firmas, texto y subrayados al PDF original
 * Usa pdf-lib para modificar y pdfjs-dist para visualizar
 */

'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import {
  FiX,
  FiLoader,
  FiAlertCircle,
  FiCheck,
  FiMove,
  FiTrash2,
  FiZoomIn,
  FiZoomOut,
  FiChevronLeft,
  FiChevronRight,
  FiType,
  FiEdit3,
  FiRotateCcw,
} from 'react-icons/fi'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import { toast } from 'react-hot-toast'
import { backofficeApi, type Asset } from '@/app/lib/backoffice'

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString()
}

type ElementType = 'stamp' | 'signature' | 'text' | 'highlight'
type ToolType = 'select' | 'text' | 'highlight'

interface PlacedElement {
  id: string
  type: ElementType
  asset?: Asset
  x: number
  y: number
  width: number
  height: number
  page: number
  // For text elements
  text?: string
  fontSize?: number
  color?: string
  // For highlight elements
  highlightColor?: string
}

interface PdfEditorModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (pdfBlob: Blob) => Promise<void>
  invoiceId: number
  invoiceNumber: string
}

export function PdfEditorModal({
  isOpen,
  onClose,
  onSave,
  invoiceId,
  invoiceNumber,
}: PdfEditorModalProps) {
  const t = useTranslations('backoffice')

  // State
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [placedElements, setPlacedElements] = useState<PlacedElement[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [scale, setScale] = useState(1)
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 })
  const [activeTool, setActiveTool] = useState<ToolType>('select')
  const [textInput, setTextInput] = useState('')
  const [textFontSize, setTextFontSize] = useState(12)
  const [highlightColor, setHighlightColor] = useState('#ffff00')

  // Undo history (max 5 states)
  const [undoHistory, setUndoHistory] = useState<PlacedElement[][]>([])
  const MAX_UNDO_HISTORY = 5

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null)
  const renderTaskRef = useRef<ReturnType<pdfjsLib.PDFPageProxy['render']> | null>(null)
  const dragRef = useRef<{
    elementId: string
    startX: number
    startY: number
    elementStartX: number
    elementStartY: number
  } | null>(null)
  const resizeRef = useRef<{
    elementId: string
    handle: 'nw' | 'ne' | 'sw' | 'se'
    startX: number
    startY: number
    elementStartX: number
    elementStartY: number
    elementStartWidth: number
    elementStartHeight: number
  } | null>(null)
  const highlightDrawRef = useRef<{
    startX: number
    startY: number
    currentId: string
  } | null>(null)

  // Fetch PDF and assets when modal opens
  useEffect(() => {
    if (!isOpen) {
      // Reset state
      setPdfBytes(null)
      setAssets([])
      setPlacedElements([])
      setSelectedElement(null)
      setCurrentPage(1)
      setScale(1)
      setError(null)
      setActiveTool('select')
      setUndoHistory([]) // Reset undo history
      pdfDocRef.current = null
      return
    }

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch assets
        const assetsResponse = await backofficeApi.getAssets()
        setAssets(assetsResponse.assets)

        // Fetch PDF via backend proxy (avoids CORS issues)
        const pdfDownloadUrl = backofficeApi.getInvoicePdfDownloadUrl(invoiceId, 'original')

        // Auth handled via cookies via apiClient session
        const pdfFetchResponse = await fetch(pdfDownloadUrl, {
          credentials: 'include',
        })

        if (!pdfFetchResponse.ok) {
          console.error('PDF fetch failed:', pdfFetchResponse.status, pdfFetchResponse.statusText)
          throw new Error(`errorDownloadingPdf:${pdfFetchResponse.status}`)
        }
        const bytes = await pdfFetchResponse.arrayBuffer()

        // Store a copy to prevent ArrayBuffer detachment issues
        setPdfBytes(bytes.slice(0))
      } catch (err: unknown) {
        console.error('Error loading PDF editor:', err)
        const errorMessage = err instanceof Error ? err.message : 'errorLoadingEditor'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isOpen, invoiceId])

  // Render PDF page when bytes or page changes
  useEffect(() => {
    if (!pdfBytes || !canvasRef.current) return

    // Use abort flag to prevent race conditions
    let isAborted = false

    // Cancel any ongoing render
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel()
      renderTaskRef.current = null
    }

    const renderPage = async () => {
      try {
        // Load PDF document only once
        if (!pdfDocRef.current) {
          // Use a copy to prevent ArrayBuffer detachment
          pdfDocRef.current = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise
          setTotalPages(pdfDocRef.current.numPages)
        }

        // Check if aborted before continuing
        if (isAborted) return

        const page = await pdfDocRef.current.getPage(currentPage)

        // Check if aborted after async operation
        if (isAborted) return

        const viewport = page.getViewport({ scale })

        const canvas = canvasRef.current
        if (!canvas || isAborted) return

        const context = canvas.getContext('2d')
        if (!context || isAborted) return

        // Clear canvas before setting new dimensions (prevents "canvas in use" error)
        context.clearRect(0, 0, canvas.width, canvas.height)

        // Set canvas dimensions
        canvas.height = viewport.height
        canvas.width = viewport.width

        setPdfDimensions({ width: viewport.width, height: viewport.height })

        // Final abort check before render
        if (isAborted) return

        // Store render task so we can cancel it if needed
        renderTaskRef.current = page.render({
          canvasContext: context,
          viewport,
          canvas, // Required by pdfjs-dist v5+
        })

        await renderTaskRef.current.promise
        renderTaskRef.current = null
      } catch (err: unknown) {
        // Ignore cancel errors and aborted renders
        if ((err instanceof Error && err.name === 'RenderingCancelledException') || isAborted) {
          return
        }
        console.error('Error rendering PDF:', err)
        setError('errorRenderingPdf')
      }
    }

    renderPage()

    // Cleanup on unmount or when dependencies change
    return () => {
      isAborted = true
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
        renderTaskRef.current = null
      }
    }
  }, [pdfBytes, currentPage, scale])

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(3, prev + 0.25))
  }, [])

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(0.5, prev - 0.25))
  }, [])

  // Undo functionality
  const saveToHistory = useCallback(
    (currentElements: PlacedElement[]) => {
      setUndoHistory((prev) => {
        const newHistory = [...prev, JSON.parse(JSON.stringify(currentElements))]
        // Keep only last MAX_UNDO_HISTORY states
        if (newHistory.length > MAX_UNDO_HISTORY) {
          return newHistory.slice(-MAX_UNDO_HISTORY)
        }
        return newHistory
      })
    },
    [MAX_UNDO_HISTORY]
  )

  const handleUndo = useCallback(() => {
    if (undoHistory.length === 0) return

    const newHistory = [...undoHistory]
    const previousState = newHistory.pop()

    setUndoHistory(newHistory)
    if (previousState !== undefined) {
      setPlacedElements(previousState)
      setSelectedElement(null)
    }
  }, [undoHistory])

  // Keyboard shortcuts (Delete key to remove selected element, Ctrl+Z to undo)
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete or Backspace to remove selected element
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
        // Don't trigger if user is typing in an input/textarea
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

        e.preventDefault()
        saveToHistory(placedElements)
        setPlacedElements((prev) => prev.filter((el) => el.id !== selectedElement))
        setSelectedElement(null)
      }

      // Ctrl+Z to undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        // Don't trigger if user is typing in an input/textarea
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

        e.preventDefault()
        handleUndo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedElement, placedElements, saveToHistory, handleUndo])

  // Handle drag start
  const handleDragStart = useCallback(
    (e: React.MouseEvent, elementId: string) => {
      if (activeTool !== 'select') return

      e.preventDefault()
      e.stopPropagation()

      const element = placedElements.find((el) => el.id === elementId)
      if (!element) return

      setSelectedElement(elementId)
      saveToHistory(placedElements) // Save before moving

      dragRef.current = {
        elementId,
        startX: e.clientX,
        startY: e.clientY,
        elementStartX: element.x,
        elementStartY: element.y,
      }
    },
    [placedElements, activeTool, saveToHistory]
  )

  // Handle resize start
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, elementId: string, handle: 'nw' | 'ne' | 'sw' | 'se') => {
      if (activeTool !== 'select') return

      e.preventDefault()
      e.stopPropagation()

      const element = placedElements.find((el) => el.id === elementId)
      if (!element) return

      setSelectedElement(elementId)
      saveToHistory(placedElements) // Save before resizing

      resizeRef.current = {
        elementId,
        handle,
        startX: e.clientX,
        startY: e.clientY,
        elementStartX: element.x,
        elementStartY: element.y,
        elementStartWidth: element.width,
        elementStartHeight: element.height,
      }
    },
    [placedElements, activeTool, saveToHistory]
  )

  // Handle drag/resize move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const currentX = (e.clientX - rect.left) / scale
      const currentY = (e.clientY - rect.top) / scale

      // Handle highlight drawing
      if (highlightDrawRef.current) {
        const { startX, startY, currentId } = highlightDrawRef.current

        // Calculate bounds (support drawing in any direction)
        const x = Math.min(startX, currentX)
        const y = Math.min(startY, currentY)
        const width = Math.abs(currentX - startX)
        const height = Math.max(14, Math.abs(currentY - startY)) // Minimum height of 14px

        setPlacedElements((prev) =>
          prev.map((el) => {
            if (el.id === currentId) {
              return { ...el, x, y, width, height }
            }
            return el
          })
        )
        return
      }

      // Handle resize
      if (resizeRef.current) {
        const currentResize = resizeRef.current
        const deltaX = (e.clientX - currentResize.startX) / scale
        const deltaY = (e.clientY - currentResize.startY) / scale
        const { handle, elementStartX, elementStartY, elementStartWidth, elementStartHeight } =
          currentResize
        const minSize = 20 // Minimum size in pixels

        setPlacedElements((prev) =>
          prev.map((el) => {
            if (el.id === currentResize.elementId) {
              let newX = elementStartX
              let newY = elementStartY
              let newWidth = elementStartWidth
              let newHeight = elementStartHeight

              // Calculate new dimensions based on which handle is being dragged
              switch (handle) {
                case 'se': // Bottom-right
                  newWidth = Math.max(minSize, elementStartWidth + deltaX)
                  newHeight = Math.max(minSize, elementStartHeight + deltaY)
                  break
                case 'sw': // Bottom-left
                  newWidth = Math.max(minSize, elementStartWidth - deltaX)
                  newHeight = Math.max(minSize, elementStartHeight + deltaY)
                  newX = elementStartX + (elementStartWidth - newWidth)
                  break
                case 'ne': // Top-right
                  newWidth = Math.max(minSize, elementStartWidth + deltaX)
                  newHeight = Math.max(minSize, elementStartHeight - deltaY)
                  newY = elementStartY + (elementStartHeight - newHeight)
                  break
                case 'nw': // Top-left
                  newWidth = Math.max(minSize, elementStartWidth - deltaX)
                  newHeight = Math.max(minSize, elementStartHeight - deltaY)
                  newX = elementStartX + (elementStartWidth - newWidth)
                  newY = elementStartY + (elementStartHeight - newHeight)
                  break
              }

              // Clamp to PDF boundaries
              const maxX = pdfDimensions.width / scale
              const maxY = pdfDimensions.height / scale
              newX = Math.max(0, Math.min(newX, maxX - minSize))
              newY = Math.max(0, Math.min(newY, maxY - minSize))
              newWidth = Math.min(newWidth, maxX - newX)
              newHeight = Math.min(newHeight, maxY - newY)

              return { ...el, x: newX, y: newY, width: newWidth, height: newHeight }
            }
            return el
          })
        )
        return
      }

      // Handle drag
      if (!dragRef.current) return

      const currentDrag = dragRef.current
      const deltaX = (e.clientX - currentDrag.startX) / scale
      const deltaY = (e.clientY - currentDrag.startY) / scale

      setPlacedElements((prev) =>
        prev.map((el) => {
          if (el.id === currentDrag.elementId) {
            const maxX = pdfDimensions.width / scale - el.width
            const maxY = pdfDimensions.height / scale - el.height
            return {
              ...el,
              x: Math.max(0, Math.min(maxX, currentDrag.elementStartX + deltaX)),
              y: Math.max(0, Math.min(maxY, currentDrag.elementStartY + deltaY)),
            }
          }
          return el
        })
      )
    },
    [scale, pdfDimensions]
  )

  // Handle drag/resize end
  const handleMouseUp = useCallback(() => {
    // Finalize highlight drawing
    if (highlightDrawRef.current) {
      const elementId = highlightDrawRef.current.currentId
      // Remove highlight if too small (accidental click)
      setPlacedElements((prev) => {
        const element = prev.find((el) => el.id === elementId)
        if (element && (element.width < 10 || element.height < 5)) {
          return prev.filter((el) => el.id !== elementId)
        }
        return prev
      })
      highlightDrawRef.current = null
    }

    dragRef.current = null
    resizeRef.current = null
  }, [])

  // Handle canvas mousedown for tools (highlight draw, text placement)
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / scale
      const y = (e.clientY - rect.top) / scale

      if (activeTool === 'highlight') {
        e.preventDefault()
        saveToHistory(placedElements) // Save before creating highlight
        const newId = `highlight-${Date.now()}`
        const newElement: PlacedElement = {
          id: newId,
          type: 'highlight',
          x,
          y,
          width: 1,
          height: 14, // Default height for text-like highlight
          page: currentPage,
          highlightColor,
        }
        setPlacedElements((prev) => [...prev, newElement])
        setSelectedElement(newId)
        highlightDrawRef.current = {
          startX: x,
          startY: y,
          currentId: newId,
        }
      }
    },
    [activeTool, highlightColor, currentPage, scale, placedElements, saveToHistory]
  )

  // Handle canvas click for text tool and deselection
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / scale
      const y = (e.clientY - rect.top) / scale

      if (activeTool === 'text' && textInput.trim()) {
        const lines = textInput.split('\n')
        const lineHeight = textFontSize * 1.2 // Line height factor
        const newElement: PlacedElement = {
          id: `text-${Date.now()}`,
          type: 'text',
          x,
          y,
          width: 200,
          height: lines.length * lineHeight + 8,
          page: currentPage,
          text: textInput,
          fontSize: textFontSize,
          color: '#000000',
        }
        saveToHistory(placedElements) // Save before adding
        setPlacedElements((prev) => [...prev, newElement])
        setSelectedElement(newElement.id)
        setTextInput('')
        setActiveTool('select')
      } else if (activeTool === 'select') {
        setSelectedElement(null)
      }
    },
    [activeTool, textInput, textFontSize, currentPage, scale, placedElements, saveToHistory]
  )

  // Add element from asset
  const handleAddAsset = useCallback(
    (asset: Asset) => {
      const newElement: PlacedElement = {
        id: `${asset.type}-${Date.now()}`,
        type: asset.type as ElementType,
        asset,
        x: 50,
        y: 50,
        width: asset.type === 'stamp' ? 120 : 100,
        height: asset.type === 'stamp' ? 120 : 50,
        page: currentPage,
      }
      saveToHistory(placedElements) // Save before adding
      setPlacedElements((prev) => [...prev, newElement])
      setSelectedElement(newElement.id)
      setActiveTool('select')
    },
    [currentPage, placedElements, saveToHistory]
  )

  // Remove selected element
  const handleRemoveElement = useCallback(() => {
    if (!selectedElement) return
    saveToHistory(placedElements) // Save before removing
    setPlacedElements((prev) => prev.filter((el) => el.id !== selectedElement))
    setSelectedElement(null)
  }, [selectedElement, placedElements, saveToHistory])

  // Save PDF with elements
  const handleSave = async () => {
    if (!pdfBytes) return

    setSaving(true)
    try {
      // Use a copy to prevent ArrayBuffer detachment issues
      const pdfDoc = await PDFDocument.load(pdfBytes.slice(0))
      const pages = pdfDoc.getPages()
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

      // Group elements by page
      const elementsByPage = placedElements.reduce(
        (acc, el) => {
          if (!acc[el.page]) acc[el.page] = []
          acc[el.page].push(el)
          return acc
        },
        {} as Record<number, PlacedElement[]>
      )

      // Add elements to each page
      for (const [pageNum, elements] of Object.entries(elementsByPage)) {
        const page = pages[parseInt(pageNum) - 1]
        if (!page) continue

        const { height: pageHeight } = page.getSize()

        for (const element of elements) {
          try {
            if (element.type === 'text' && element.text) {
              // Add multiline text with word-wrap
              const fontSize = element.fontSize || 12
              const lineHeight = fontSize * 1.2
              const maxWidth = element.width

              // Function to wrap text to fit within maxWidth
              const wrapText = (
                text: string,
                font: typeof helveticaFont,
                size: number,
                maxW: number
              ): string[] => {
                const wrappedLines: string[] = []
                // First split by explicit line breaks
                const paragraphs = text.split('\n')

                for (const paragraph of paragraphs) {
                  if (!paragraph.trim()) {
                    wrappedLines.push('') // Preserve empty lines
                    continue
                  }

                  const words = paragraph.split(' ')
                  let currentLine = ''

                  for (const word of words) {
                    const testLine = currentLine ? `${currentLine} ${word}` : word
                    const testWidth = font.widthOfTextAtSize(testLine, size)

                    if (testWidth <= maxW) {
                      currentLine = testLine
                    } else {
                      if (currentLine) {
                        wrappedLines.push(currentLine)
                      }
                      // If single word is too long, just add it anyway
                      currentLine = word
                    }
                  }

                  if (currentLine) {
                    wrappedLines.push(currentLine)
                  }
                }

                return wrappedLines
              }

              const lines = wrapText(element.text, helveticaFont, fontSize, maxWidth)

              lines.forEach((line, idx) => {
                page.drawText(line, {
                  x: element.x,
                  y: pageHeight - element.y - fontSize - idx * lineHeight,
                  size: fontSize,
                  font: helveticaFont,
                  color: rgb(0, 0, 0),
                })
              })
            } else if (element.type === 'highlight' && element.highlightColor) {
              // Add highlight (rectangle with transparency)
              const hexColor = element.highlightColor.replace('#', '')
              const r = parseInt(hexColor.substr(0, 2), 16) / 255
              const g = parseInt(hexColor.substr(2, 2), 16) / 255
              const b = parseInt(hexColor.substr(4, 2), 16) / 255

              page.drawRectangle({
                x: element.x,
                y: pageHeight - element.y - element.height,
                width: element.width,
                height: element.height,
                color: rgb(r, g, b),
                opacity: 0.3,
              })
            } else if (element.asset) {
              // Add stamp/signature image
              const imageResponse = await fetch(element.asset.cloudinary_url)
              const imageBytes = await imageResponse.arrayBuffer()

              let image
              const url = element.asset.cloudinary_url.toLowerCase()
              if (url.includes('.png') || url.includes('png')) {
                image = await pdfDoc.embedPng(imageBytes)
              } else if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('jpg')) {
                image = await pdfDoc.embedJpg(imageBytes)
              } else {
                try {
                  image = await pdfDoc.embedPng(imageBytes)
                } catch {
                  image = await pdfDoc.embedJpg(imageBytes)
                }
              }

              page.drawImage(image, {
                x: element.x,
                y: pageHeight - element.y - element.height,
                width: element.width,
                height: element.height,
              })
            }
          } catch (elemError) {
            console.error('Error adding element to PDF:', elemError)
          }
        }
      }

      // Save PDF
      const modifiedPdfBytes = await pdfDoc.save()
      // Convert Uint8Array to ArrayBuffer for Blob compatibility
      const blob = new Blob([modifiedPdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })

      await onSave(blob)
      toast.success(t('toast.pdfValidatedSuccess'))
      onClose()
    } catch (err: unknown) {
      console.error('Error saving PDF:', err)
      toast.error(err instanceof Error ? err.message : t('toast.pdfSaveError'))
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  const stamps = assets.filter((a) => a.type === 'stamp')
  const signatures = assets.filter((a) => a.type === 'signature')
  const currentPageElements = placedElements.filter((el) => el.page === currentPage)

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70">
      {/* Modal Container */}
      <div className="flex h-full">
        {/* Sidebar - Tools and Assets */}
        <div className="w-72 bg-white dark:bg-[#151b23] border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t('modals.pdfEditor.title')}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {invoiceNumber}
            </p>
          </div>

          {/* Tools Section */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
              {t('modals.pdfEditor.tools')}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTool('select')}
                className={`p-2 rounded-lg transition-colors ${
                  activeTool === 'select'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
                title={t('modals.pdfEditor.selectAndMove')}
              >
                <FiMove className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveTool('text')}
                className={`p-2 rounded-lg transition-colors ${
                  activeTool === 'text'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
                title={t('modals.pdfEditor.addText')}
              >
                <FiType className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveTool('highlight')}
                className={`p-2 rounded-lg transition-colors ${
                  activeTool === 'highlight'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
                title={t('modals.pdfEditor.highlight')}
              >
                <FiEdit3 className="w-5 h-5" />
              </button>
            </div>

            {/* Text tool options */}
            {activeTool === 'text' && (
              <div className="mt-3 space-y-2">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={t('modals.pdfEditor.textPlaceholder')}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                />
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    {t('modals.pdfEditor.fontSize')}
                  </label>
                  <select
                    value={textFontSize}
                    onChange={(e) => setTextFontSize(Number(e.target.value))}
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value={8}>8</option>
                    <option value={10}>10</option>
                    <option value={12}>12</option>
                    <option value={14}>14</option>
                    <option value={16}>16</option>
                    <option value={18}>18</option>
                    <option value={24}>24</option>
                  </select>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                  {t('modals.pdfEditor.clickToAddText')}
                </p>
              </div>
            )}

            {/* Highlight tool options */}
            {activeTool === 'highlight' && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    {t('modals.pdfEditor.highlightColor')}
                  </label>
                  <input
                    type="color"
                    value={highlightColor}
                    onChange={(e) => setHighlightColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                  <div className="flex gap-1">
                    {['#ffff00', '#00ff00', '#ff9999', '#99ccff'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setHighlightColor(color)}
                        className={`w-6 h-6 rounded border-2 ${
                          highlightColor === color
                            ? 'border-gray-900 dark:border-white'
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                  {t('modals.pdfEditor.clickAndDragToHighlight')}
                </p>
              </div>
            )}
          </div>

          {/* Assets List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Stamps */}
            <div>
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                {t('modals.pdfEditor.stamps')}
              </h3>
              {stamps.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                  {t('modals.pdfEditor.noStampsAvailable')}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {stamps.map((stamp) => (
                    <button
                      key={stamp.id}
                      onClick={() => handleAddAsset(stamp)}
                      className="aspect-square p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title={stamp.name}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={stamp.cloudinary_url}
                        alt={stamp.name}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Signatures */}
            <div>
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                {t('modals.pdfEditor.signatures')}
              </h3>
              {signatures.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                  {t('modals.pdfEditor.noSignaturesAvailable')}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {signatures.map((sig) => (
                    <button
                      key={sig.id}
                      onClick={() => handleAddAsset(sig)}
                      className="aspect-video p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title={sig.name}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sig.cloudinary_url}
                        alt={sig.name}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Element Actions */}
          {selectedElement && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0d1117]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {t('modals.pdfEditor.selectedElement')}
                </span>
                <button
                  onClick={handleRemoveElement}
                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  title={t('modals.pdfEditor.deleteElement')}
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                {t('modals.pdfEditor.dragToMove')}
              </p>
            </div>
          )}

          {/* Save Button */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
            {/* Debug info */}
            <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center">
              {t('modals.pdfEditor.elementsCount', {
                count: placedElements.length,
                pageCount: currentPageElements.length,
              })}
            </p>

            {/* Primary save button - with elements */}
            <button
              onClick={handleSave}
              disabled={saving || placedElements.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  {t('modals.pdfEditor.saving')}
                </>
              ) : (
                <>
                  <FiCheck className="w-4 h-4" />
                  {t('modals.pdfEditor.saveAndValidate')}
                </>
              )}
            </button>

            {/* Secondary option - validate without modifications */}
            {placedElements.length === 0 && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <FiCheck className="w-3.5 h-3.5" />
                {t('modals.pdfEditor.validateWithoutModify')}
              </button>
            )}
          </div>
        </div>

        {/* Main Content - PDF Viewer */}
        <div className="flex-1 flex flex-col bg-gray-900">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-2">
              {/* Undo button */}
              <button
                onClick={handleUndo}
                disabled={undoHistory.length === 0}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('modals.pdfEditor.undoCount', { count: undoHistory.length })}
              >
                <FiRotateCcw className="w-4 h-4" />
              </button>

              <div className="w-px h-6 bg-gray-600 mx-1" />

              {/* Zoom controls */}
              <button
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('modals.pdfEditor.zoomOut')}
              >
                <FiZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-400 w-12 text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={scale >= 3}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('modals.pdfEditor.zoomIn')}
              >
                <FiZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-400">
                {t('modals.pdfEditor.page', { current: currentPage, total: totalPages })}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title={t('modals.pdfEditor.close')}
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* PDF Canvas Area */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            {loading ? (
              <div className="flex flex-col items-center text-gray-400">
                <FiLoader className="w-10 h-10 animate-spin mb-4" />
                <p>{t('modals.pdfEditor.loadingPdf')}</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center text-red-400">
                <FiAlertCircle className="w-10 h-10 mb-4" />
                <p className="font-medium">{t('modals.pdfEditor.errorLoadingPdf')}</p>
                <p className="text-sm mt-1 text-gray-400">
                  {error.startsWith('errorDownloadingPdf:')
                    ? t('modals.pdfEditor.errorDownloadingPdf', { status: error.split(':')[1] })
                    : t(`modals.pdfEditor.${error}`)}
                </p>
              </div>
            ) : (
              <div
                ref={containerRef}
                className={`relative bg-white shadow-2xl ${
                  activeTool !== 'select' ? 'cursor-crosshair' : 'cursor-default'
                }`}
                style={{ width: pdfDimensions.width, height: pdfDimensions.height }}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={handleCanvasClick}
              >
                {/* PDF Canvas */}
                <canvas ref={canvasRef} className="block" />

                {/* Placed Elements Overlay */}
                {currentPageElements.map((element) => (
                  <div
                    key={element.id}
                    className={`absolute ${activeTool === 'select' ? 'cursor-move' : 'pointer-events-none'} ${
                      selectedElement === element.id
                        ? 'ring-2 ring-blue-500 ring-offset-2'
                        : activeTool === 'select'
                          ? 'hover:ring-2 hover:ring-blue-300'
                          : ''
                    }`}
                    style={{
                      left: element.x * scale,
                      top: element.y * scale,
                      width: element.width * scale,
                      height: element.height * scale,
                    }}
                    onMouseDown={(e) => {
                      if (activeTool === 'select') {
                        handleDragStart(e, element.id)
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (activeTool === 'select') {
                        setSelectedElement(element.id)
                      }
                    }}
                  >
                    {/* Highlight background */}
                    {element.type === 'highlight' && (
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          backgroundColor: element.highlightColor,
                          opacity: 0.4,
                        }}
                      />
                    )}
                    {element.type === 'text' && element.text && (
                      <div
                        className="pointer-events-none select-none text-black w-full h-full overflow-hidden"
                        style={{
                          fontSize: (element.fontSize || 12) * scale,
                          lineHeight: 1.2,
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {element.text}
                      </div>
                    )}
                    {element.asset && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={element.asset.cloudinary_url}
                        alt={element.asset.name}
                        className="w-full h-full object-contain pointer-events-none"
                        draggable={false}
                      />
                    )}
                    {/* Resize handles - show for all selected elements */}
                    {selectedElement === element.id && activeTool === 'select' && (
                      <>
                        {/* NW handle */}
                        <div
                          className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-nw-resize z-10"
                          onMouseDown={(e) => handleResizeStart(e, element.id, 'nw')}
                        />
                        {/* NE handle */}
                        <div
                          className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-ne-resize z-10"
                          onMouseDown={(e) => handleResizeStart(e, element.id, 'ne')}
                        />
                        {/* SW handle */}
                        <div
                          className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-sw-resize z-10"
                          onMouseDown={(e) => handleResizeStart(e, element.id, 'sw')}
                        />
                        {/* SE handle */}
                        <div
                          className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-se-resize z-10"
                          onMouseDown={(e) => handleResizeStart(e, element.id, 'se')}
                        />
                      </>
                    )}
                    {/* Move indicator */}
                    {selectedElement === element.id && activeTool === 'select' && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1 whitespace-nowrap">
                        <FiMove className="w-3 h-3" />
                        {t('modals.pdfEditor.moveAndResize')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

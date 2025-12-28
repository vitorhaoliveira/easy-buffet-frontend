import { Injectable } from '@angular/core'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * Interface for Excel sheet data
 */
export interface ExcelSheetData {
  sheetName: string
  data: any[][]
  columnWidths?: number[]
}

/**
 * Interface for PDF table data
 */
export interface PDFTableData {
  title?: string
  headers: string[]
  rows: any[][]
}

/**
 * Interface for PDF export options
 */
export interface PDFExportOptions {
  title: string
  subtitle?: string
  tables: PDFTableData[]
  filename: string
  orientation?: 'portrait' | 'landscape'
}

/**
 * Interface for Excel export options
 */
export interface ExcelExportOptions {
  sheets: ExcelSheetData[]
  filename: string
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  /**
   * @Function - exportToExcel
   * @description - Exports data to an Excel file with multiple sheets
   * @author - Vitor Hugo
   * @param - options: ExcelExportOptions - Options containing sheets data and filename
   * @returns - void
   */
  exportToExcel(options: ExcelExportOptions): void {
    const workbook = XLSX.utils.book_new()

    options.sheets.forEach(sheet => {
      const worksheet = XLSX.utils.aoa_to_sheet(sheet.data)

      // Apply column widths if provided
      if (sheet.columnWidths) {
        worksheet['!cols'] = sheet.columnWidths.map(width => ({ wch: width }))
      }

      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.sheetName)
    })

    // Generate and download the file
    XLSX.writeFile(workbook, `${options.filename}.xlsx`)
  }

  /**
   * @Function - exportToPDF
   * @description - Exports data to a PDF file with formatted tables
   * @author - Vitor Hugo
   * @param - options: PDFExportOptions - Options containing tables, title and filename
   * @returns - void
   */
  exportToPDF(options: PDFExportOptions): void {
    const doc = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    let currentY = 20

    // Add title
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(options.title, pageWidth / 2, currentY, { align: 'center' })
    currentY += 10

    // Add subtitle if provided
    if (options.subtitle) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(options.subtitle, pageWidth / 2, currentY, { align: 'center' })
      currentY += 10
    }

    currentY += 5

    // Add each table
    options.tables.forEach((table, index) => {
      // Add table title if provided
      if (table.title) {
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text(table.title, 14, currentY)
        currentY += 8
      }

      // Generate table using autoTable
      autoTable(doc, {
        startY: currentY,
        head: [table.headers],
        body: table.rows,
        theme: 'striped',
        headStyles: {
          fillColor: [16, 185, 129], // Emerald-500
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'left'
        },
        bodyStyles: {
          textColor: [55, 65, 81], // Gray-700
          halign: 'left'
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251] // Gray-50
        },
        margin: { left: 14, right: 14 },
        tableWidth: 'auto'
      })

      // Get the final Y position after the table
      currentY = (doc as any).lastAutoTable.finalY + 15

      // Add page break if needed and not the last table
      if (index < options.tables.length - 1 && currentY > 250) {
        doc.addPage()
        currentY = 20
      }
    })

    // Add footer with generation date
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(128, 128, 128)

      const footerText = `Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`
      doc.text(footerText, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' })

      // Add page number
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth - 14,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'right' }
      )
    }

    // Save the PDF
    doc.save(`${options.filename}.pdf`)
  }

  /**
   * @Function - formatCurrencyForExport
   * @description - Formats a number as Brazilian currency string for export
   * @author - Vitor Hugo
   * @param - value: number | undefined - The value to format
   * @returns - string - Formatted currency string
   */
  formatCurrencyForExport(value: number | undefined): string {
    const numValue = value || 0
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue)
  }

  /**
   * @Function - formatPercentageForExport
   * @description - Formats a number as percentage string for export
   * @author - Vitor Hugo
   * @param - value: number | undefined - The value to format
   * @returns - string - Formatted percentage string
   */
  formatPercentageForExport(value: number | undefined): string {
    const numValue = value || 0
    return `${numValue.toFixed(2)}%`
  }

  /**
   * @Function - formatDateForExport
   * @description - Formats a date string to Brazilian format for export
   * @author - Vitor Hugo
   * @param - dateString: string | null | undefined - ISO date string
   * @returns - string - Formatted date or empty string
   */
  formatDateForExport(dateString: string | null | undefined): string {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }
}


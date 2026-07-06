import { jsPDF } from 'jspdf'

import type { AnalysisResponse } from '../types/analysis'
import { buildIncidentReport } from './incidentReport'
import { formatGeneratedAt } from './formatDate'
import { buildIncidentReportFilename } from './reportFilename'

const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const MARGIN = 18
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const LINE_HEIGHT = 5.5

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_HEIGHT - MARGIN) {
    doc.addPage()
    return MARGIN
  }
  return y
}

function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize = 10,
): number {
  doc.setFontSize(fontSize)
  const lines = doc.splitTextToSize(text, maxWidth) as string[]
  for (const line of lines) {
    y = ensureSpace(doc, y, LINE_HEIGHT)
    doc.text(line, x, y)
    y += LINE_HEIGHT
  }
  return y
}

function addHeading(doc: jsPDF, text: string, y: number, size = 13): number {
  y = ensureSpace(doc, y, LINE_HEIGHT + 2)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(size)
  doc.text(text, MARGIN, y)
  doc.setFont('helvetica', 'normal')
  return y + LINE_HEIGHT + 2
}

function renderMarkdownLikePdf(doc: jsPDF, markdown: string, startY: number): number {
  let y = startY
  for (const rawLine of markdown.split('\n')) {
    const line = rawLine.trimEnd()
    if (!line) {
      y += 2
      continue
    }
    if (line.startsWith('# ')) {
      y = addHeading(doc, line.slice(2), y, 16)
      continue
    }
    if (line.startsWith('## ')) {
      y = addHeading(doc, line.slice(3), y, 13)
      continue
    }
    if (line.startsWith('### ')) {
      y = addHeading(doc, line.slice(4), y, 11)
      continue
    }
    if (line.startsWith('```')) continue
    const cleaned = line.replace(/\*\*/g, '').replace(/^- /, '• ').replace(/^\d+\. /, (m) => m)
    y = addWrappedText(doc, cleaned, MARGIN, y, CONTENT_WIDTH, 10)
  }
  return y
}

/** Download a PDF using the professional incident report layout. */
export function downloadPdfReport(report: AnalysisResponse): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const markdown = buildIncidentReport(report)
  let y = renderMarkdownLikePdf(doc, markdown, MARGIN)

  if (report.risk_scores) {
    y += 4
    y = addHeading(doc, 'Risk Scores', y)
    const scores = [
      `Availability: ${report.risk_scores.availability}%`,
      `Security: ${report.risk_scores.security}%`,
      `Storage: ${report.risk_scores.storage}%`,
      `Memory: ${report.risk_scores.memory}%`,
      `Networking: ${report.risk_scores.networking}%`,
    ]
    for (const line of scores) {
      y = addWrappedText(doc, line, MARGIN + 2, y, CONTENT_WIDTH - 2, 10)
    }
  }

  y = ensureSpace(doc, y + 8, LINE_HEIGHT)
  doc.setFontSize(8)
  doc.setTextColor(120)
  doc.text(`Generated ${formatGeneratedAt(report.generated_at)} · Server Pulse`, MARGIN, y + 4)
  doc.setTextColor(0)

  doc.save(buildIncidentReportFilename(report.generated_at, 'pdf'))
}

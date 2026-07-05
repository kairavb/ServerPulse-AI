/** Build incident-report-YYYY-MM-DD-HHmmss filename stem from a report timestamp. */
export function buildIncidentReportFilename(
  generatedAt: string | null | undefined,
  extension: 'md' | 'pdf',
): string {
  const date = generatedAt ? new Date(generatedAt) : new Date()
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  return `incident-report-${yyyy}-${mm}-${dd}-${hh}${min}${ss}.${extension}`
}

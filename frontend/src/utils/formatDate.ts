/** Format ISO timestamp for display in the health report UI and exports. */
export function formatGeneratedAt(iso: string | null | undefined): string {
  if (!iso) {
    return new Date().toLocaleString()
  }
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return iso
  }
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

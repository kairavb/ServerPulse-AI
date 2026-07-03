import { SUPPORTED_LOG_FILES } from '../api/client'

interface FileListProps {
  files: File[]
  onRemove: (index: number) => void
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileList({ files, onRemove }: FileListProps) {
  if (files.length === 0) {
    return null
  }

  return (
    <ul className="mt-4 space-y-2">
      {files.map((file, index) => (
        <li
          key={`${file.name}-${index}`}
          className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
        >
          <div className="min-w-0 text-left">
            <p className="truncate font-medium text-slate-800">{file.name}</p>
            <p className="text-xs text-slate-500">{formatSize(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
            aria-label={`Remove ${file.name}`}
          >
            Remove
          </button>
        </li>
      ))}
      <p className="text-left text-xs text-slate-500">
        Accepted: {SUPPORTED_LOG_FILES.join(', ')}
      </p>
    </ul>
  )
}

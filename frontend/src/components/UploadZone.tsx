import { useRef, useState, type DragEvent } from 'react'

import { SUPPORTED_LOG_FILES } from '../api/client'
import { FileList } from './FileList'

interface UploadZoneProps {
  files: File[]
  disabled?: boolean
  onFilesChange: (files: File[]) => void
}

const ACCEPT = SUPPORTED_LOG_FILES.map((name) => `.${name.split('.').pop()}`).join(',')

function isSupportedFile(file: File): boolean {
  const name = file.name.toLowerCase().split('/').pop() ?? ''
  return (SUPPORTED_LOG_FILES as readonly string[]).includes(name)
}

function mergeFiles(existing: File[], incoming: File[]): File[] {
  const seen = new Set(existing.map((file) => file.name))
  const merged = [...existing]

  for (const file of incoming) {
    if (!isSupportedFile(file)) continue
    if (seen.has(file.name)) continue
    seen.add(file.name)
    merged.push(file)
  }

  return merged
}

export function UploadZone({ files, disabled = false, onFilesChange }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming || disabled) return
    onFilesChange(mergeFiles(files, Array.from(incoming)))
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    handleFiles(event.dataTransfer.files)
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div
        onDragEnter={(event) => {
          event.preventDefault()
          if (!disabled) setIsDragging(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault()
          setIsDragging(false)
        }}
        onDrop={onDrop}
        className={`rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
          isDragging
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-slate-300 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/40'
        } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
        </div>
        <p className="text-base font-medium text-slate-800">
          Drag and drop log files here
        </p>
        <p className="mt-1 text-sm text-slate-500">or choose files from your computer</p>
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-indigo-700 ring-1 ring-indigo-200 transition hover:bg-indigo-50 disabled:cursor-not-allowed"
        >
          Browse files
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          disabled={disabled}
          onChange={(event) => {
            handleFiles(event.target.files)
            event.target.value = ''
          }}
        />
      </div>

      <FileList
        files={files}
        onRemove={(index) => onFilesChange(files.filter((_, i) => i !== index))}
      />
    </section>
  )
}

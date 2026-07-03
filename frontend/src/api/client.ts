import type { AnalysisResponse } from '../types/analysis'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export const SUPPORTED_LOG_FILES = [
  'journal.log',
  'nginx-error.log',
  'docker.log',
  'pm2.log',
  'free.txt',
  'df.txt',
  'systemctl.txt',
] as const

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function analyzeLogs(files: File[]): Promise<AnalysisResponse> {
  const formData = new FormData()
  for (const file of files) {
    formData.append('files', file)
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      body: formData,
    })
  } catch {
    throw new ApiError('Could not reach the server.', 0)
  }

  if (!response.ok) {
    throw new ApiError(mapErrorMessage(response.status, await readDetail(response)), response.status)
  }

  return response.json() as Promise<AnalysisResponse>
}

function mapErrorMessage(status: number, detail: string): string {
  if (status === 400) {
    return detail || 'Invalid upload. Check your files and try again.'
  }
  if (status === 502 || status === 504) {
    return 'Analysis service unavailable. Try again.'
  }
  if (status === 500) {
    return 'An unexpected error occurred. Please try again.'
  }
  return detail || 'Something went wrong. Please try again.'
}

async function readDetail(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { detail?: string | Array<{ msg?: string }> }
    if (typeof body.detail === 'string') {
      return body.detail
    }
    if (Array.isArray(body.detail)) {
      return body.detail.map((item) => item.msg).filter(Boolean).join(' ')
    }
  } catch {
    // Response may not be JSON.
  }
  return ''
}

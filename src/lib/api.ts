type FieldErrors = Record<string, string[]>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: FieldErrors = {}

  constructor(status: number, payload: unknown) {
    const data = isRecord(payload) ? payload : {}
    super(typeof data.message === 'string' ? data.message : `Request failed (${status}).`)
    this.name = 'ApiError'
    this.status = status

    if (isRecord(data.errors)) {
      for (const [field, messages] of Object.entries(data.errors)) {
        if (typeof messages === 'string') this.fieldErrors[field] = [messages]
        else if (Array.isArray(messages)) {
          this.fieldErrors[field] = messages.filter(
            (item): item is string => typeof item === 'string',
          )
        }
      }
    }
  }
}

interface RequestOptions extends Omit<RequestInit, 'body' | 'credentials'> {
  body?: unknown
  token?: string
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const configuredBase = import.meta.env.VITE_API_URL?.trim()
  if (!configuredBase) throw new Error('VITE_API_URL is not configured.')
  if (/^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith('//') || path.includes('\\')) {
    throw new Error('API paths must be relative to the configured API base.')
  }

  const base = new URL(`${configuredBase.replace(/\/+$/, '')}/`, globalThis.location?.origin)
  const url = new URL(path.replace(/^\//, ''), base)
  if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) {
    throw new Error('API paths must stay inside the configured API base.')
  }

  const { body, token, headers: suppliedHeaders, ...init } = options
  const headers = new Headers(suppliedHeaders)
  headers.set('Accept', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (body !== undefined) headers.set('Content-Type', 'application/json')

  const response = await fetch(url, {
    ...init,
    headers,
    credentials: 'omit',
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })

  const text = await response.text()
  let payload: unknown
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      if (response.ok) throw new Error('The API returned an invalid JSON response.')
    }
  }
  if (!response.ok) throw new ApiError(response.status, payload)
  return payload as T
}

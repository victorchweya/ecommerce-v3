import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, request } from '../api'

const fetcher = vi.fn<typeof fetch>()

beforeEach(() => {
  fetcher.mockReset()
  vi.stubEnv('VITE_API_URL', 'https://api.example.test/api')
  vi.stubGlobal('fetch', fetcher)
})

describe('API transport', () => {
  it('keeps API paths under the configured base and passes JSON, bearer token, and cancellation', async () => {
    fetcher.mockResolvedValue(new Response('{"id":1}', { status: 201 }))
    const controller = new AbortController()

    await expect(
      request<{ id: number }>('/ecommerce/orders', {
        method: 'POST',
        token: 'test-token',
        body: { products: [] },
        signal: controller.signal,
      }),
    ).resolves.toEqual({ id: 1 })

    const [url, options] = fetcher.mock.calls[0]!
    expect(String(url)).toBe('https://api.example.test/api/ecommerce/orders')
    expect(options).toMatchObject({
      method: 'POST',
      credentials: 'omit',
      body: '{"products":[]}',
      signal: controller.signal,
    })
    const headers = new Headers(options?.headers)
    expect(headers.get('Authorization')).toBe('Bearer test-token')
    expect(headers.get('Content-Type')).toBe('application/json')
  })

  it('preserves validation messages and field errors without replaying the write', async () => {
    fetcher.mockResolvedValue(
      new Response(
        JSON.stringify({
          message: 'Please check your details.',
          errors: { email: ['Enter a valid email.'], phone: 'Enter a phone number.' },
        }),
        { status: 422 },
      ),
    )

    await expect(request('/auth/login', { method: 'POST', body: {} })).rejects.toMatchObject({
      name: 'ApiError',
      status: 422,
      message: 'Please check your details.',
      fieldErrors: { email: ['Enter a valid email.'], phone: ['Enter a phone number.'] },
    })
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it.each([401, 403])(
    'preserves HTTP %i for the session/permission flow to handle',
    async (status) => {
      fetcher.mockResolvedValue(new Response('{}', { status }))
      await expect(request('/ecommerce/profile')).rejects.toMatchObject({ status })
    },
  )

  it('retains HTTP status when an error response is not JSON', async () => {
    fetcher.mockResolvedValue(new Response('<html>Unavailable</html>', { status: 503 }))
    await expect(request('/ecommerce/products')).rejects.toMatchObject({
      name: ApiError.name,
      status: 503,
      message: 'Request failed (503).',
    })
  })

  it('rejects a malformed successful response instead of returning invalid data', async () => {
    fetcher.mockResolvedValue(new Response('invalid JSON'))
    await expect(request('/ecommerce/products')).rejects.toThrow('invalid JSON')
  })

  it('supports an empty successful response', async () => {
    fetcher.mockResolvedValue(new Response(null, { status: 204 }))
    await expect(
      request<void>('/ecommerce/addresses/1', { method: 'DELETE' }),
    ).resolves.toBeUndefined()
  })

  it('leaves cancellation distinguishable from HTTP failure', async () => {
    const cancelled = new DOMException('Cancelled', 'AbortError')
    fetcher.mockRejectedValue(cancelled)
    await expect(request('/ecommerce/products')).rejects.toBe(cancelled)
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it.each([
    'https://other.example/products',
    '//other.example/products',
    '../outside',
    '%2e%2e/outside',
  ])('rejects paths outside the configured API: %s', async (path) => {
    await expect(request(path, { token: 'test-token' })).rejects.toThrow('API paths')
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('supports a same-origin API base', async () => {
    vi.stubEnv('VITE_API_URL', '/api')
    fetcher.mockResolvedValue(new Response('[]'))
    await request('/ecommerce/products')
    expect(String(fetcher.mock.calls[0]?.[0])).toBe(`${location.origin}/api/ecommerce/products`)
  })

  it('fails before making a request when the API base is missing', async () => {
    vi.stubEnv('VITE_API_URL', '')
    await expect(request('/ecommerce/products')).rejects.toThrow('not configured')
    expect(fetcher).not.toHaveBeenCalled()
  })
})

import { afterEach, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { useCertificate } from '../useCertificate'
import { useDeliveryLocation } from '../useDeliveryLocation'
const scopes: ReturnType<typeof effectScope>[] = []
afterEach(() => {
  scopes.splice(0).forEach((scope) => scope.stop())
})
function scoped<T>(factory: () => T) {
  const scope = effectScope()
  scopes.push(scope)
  return { scope, value: scope.run(factory)! }
}
it('does not invent a delivery location and handles permission failure with manual entry', () => {
  const getCurrentPosition = vi.fn((_success, error) => error({ code: 1 }))
  vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } })
  const { value } = scoped(useDeliveryLocation)
  expect(value.coordinates()).toBeUndefined()
  value.locate()
  expect(value.error.value).toContain('manually')
  value.latitude.value = '0'
  value.longitude.value = '0'
  expect(value.coordinates()).toEqual({ latitude: 0, longitude: 0 })
})
it('ignores a geolocation response after the form is disposed', () => {
  let reply!: PositionCallback
  vi.stubGlobal('navigator', {
    geolocation: {
      getCurrentPosition: (success: PositionCallback) => {
        reply = success
      },
    },
  })
  const { scope, value } = scoped(useDeliveryLocation)
  value.locate()
  scope.stop()
  reply({ coords: { latitude: -1.28, longitude: 36.82 } } as GeolocationPosition)
  expect(value.latitude.value).toBe('')
})
it('rejects unsupported or oversized certificate files before reading them', () => {
  const { value } = scoped(useCertificate)
  value.select(new File(['test'], 'script.html', { type: 'text/html' }))
  expect(value.error.value).toContain('Choose a PDF')
  expect(value.data.value).toBeUndefined()
  value.select({ size: 5_000_001, type: 'application/pdf' } as File)
  expect(value.error.value).toContain('5 MB')
  expect(value.reading.value).toBe(false)
})
it('keeps only the latest certificate read and aborts pending reads on disposal', () => {
  const readers: {
    result: string | null
    onload: (() => void) | null
    onerror: (() => void) | null
    abort: ReturnType<typeof vi.fn>
    readAsDataURL: ReturnType<typeof vi.fn>
  }[] = []
  vi.stubGlobal(
    'FileReader',
    class {
      result: string | null = null
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      abort = vi.fn()
      readAsDataURL = vi.fn()
      constructor() {
        readers.push(this)
      }
    },
  )
  const { scope, value } = scoped(useCertificate)
  value.select(new File(['first'], 'first.pdf', { type: 'application/pdf' }))
  value.select(new File(['second'], 'second.pdf', { type: 'application/pdf' }))
  readers[0]!.result = 'old'
  readers[0]!.onload!()
  expect(value.data.value).toBeUndefined()
  readers[1]!.result = 'data:application/pdf;base64,c2Vjb25k'
  readers[1]!.onload!()
  expect(value.name.value).toBe('second.pdf')
  scope.stop()
  expect(readers[1]!.abort).toHaveBeenCalled()
  expect(value.data.value).toBeUndefined()
})

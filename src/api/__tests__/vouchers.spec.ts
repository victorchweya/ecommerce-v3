import { beforeEach, expect, it, vi } from 'vitest'
import { fetchVoucher } from '../checkout'
const fetchMock = vi.fn()
const coupon = {
  code: 'SAVE ME',
  discount_type: 'Percentage',
  discount_value: '10.00',
  status: 'Active',
  expiry_date: null,
}
beforeEach(() => {
  vi.stubEnv('VITE_API_URL', 'https://api.example.test/api')
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockReset()
})
it('reads bare/no-voucher responses and sends branch context only as supported', async () => {
  fetchMock
    .mockResolvedValueOnce(new Response(JSON.stringify({ message: 'No valid voucher found.' })))
    .mockResolvedValueOnce(new Response(JSON.stringify(coupon)))
  expect(await fetchVoucher('token', null, new AbortController().signal)).toBeNull()
  expect(
    (await fetchVoucher('token', 22, new AbortController().signal, 'SAVE ME'))?.discount_value,
  ).toBe(10)
  expect(String(fetchMock.mock.calls[0]![0])).toBe(
    'https://api.example.test/api/ecommerce/vouchers',
  )
  expect(String(fetchMock.mock.calls[1]![0])).toBe(
    'https://api.example.test/api/ecommerce/vouchers/SAVE%20ME?branch_company_id=22',
  )
})
it('rejects malformed/wrong-code responses and leaves eligibility errors un-replayed', async () => {
  fetchMock
    .mockResolvedValueOnce(new Response(JSON.stringify({ ...coupon, code: 'OTHER' })))
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Invalid voucher' }), { status: 400 }),
    )
  await expect(
    fetchVoucher('token', null, new AbortController().signal, 'SAVE ME'),
  ).rejects.toThrow('Unexpected voucher')
  await expect(
    fetchVoucher('token', null, new AbortController().signal, 'SAVE ME'),
  ).rejects.toMatchObject({ status: 400 })
  expect(fetchMock).toHaveBeenCalledTimes(2)
})

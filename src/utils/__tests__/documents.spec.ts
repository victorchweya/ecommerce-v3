import { it, expect } from 'vitest'
import { safeDocumentUrl } from '../documents'
import { trendPoints } from '../account/chart'
it('permits ordinary issued document URLs and blocks executable/credential URLs', () => {
  expect(safeDocumentUrl('https://invoice.example.test/1')).toBe('https://invoice.example.test/1')
  for (const value of [
    'javascript:alert(1)',
    'data:text/html,test',
    'https://user:secret@example.test',
    '//example.test',
    '',
  ])
    expect(safeDocumentUrl(value)).toBeNull()
})
it('renders empty, single-point and flat price series without NaN or Infinity', () => {
  expect(trendPoints([])).toBe('')
  expect(trendPoints([{ date: '01-01-2026', price: 0 }])).toBe('150,60')
  expect(
    trendPoints([
      { date: '01-01-2026', price: 4 },
      { date: '02-01-2026', price: 4 },
    ]),
  ).toBe('10,60 290,60')
})

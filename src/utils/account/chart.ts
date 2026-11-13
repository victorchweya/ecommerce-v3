import type { PriceTrend } from '@/types/account'
export function trendPoints(data: PriceTrend['data']) {
  if (!data.length) return ''
  const min = Math.min(...data.map((point) => point.price))
  const max = Math.max(...data.map((point) => point.price))
  return data
    .map(
      (point, index) =>
        `${data.length === 1 ? 150 : 10 + (index / (data.length - 1)) * 280},${max === min ? 60 : 110 - ((point.price - min) / (max - min)) * 100}`,
    )
    .join(' ')
}

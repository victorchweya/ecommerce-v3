import type { ProductSelection, Product, GradeVariant, UnitVariant } from './catalog'
export type CartSelection = ProductSelection
export interface CartLine {
  key: string
  selection: CartSelection
  product?: Product
  grade?: GradeVariant
  unit?: UnitVariant
  issue: string
  portions: { quantity: number; unitPrice: number; sale: boolean; total: number }[]
  total: number
  includedTax: number
}

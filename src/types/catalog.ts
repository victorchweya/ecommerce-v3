import { z } from 'zod'

// Laravel decimal columns may arrive as JSON numbers or decimal strings.
export const decimalSchema = z
  .union([z.number(), z.string().regex(/^-?\d+(?:\.\d+)?$/)])
  .transform(Number)
  .pipe(z.number().finite())
const amount = decimalSchema.pipe(z.number().nonnegative())
const id = z.number().int().positive()
const flag = z.union([z.boolean(), z.literal(0), z.literal(1)]).transform(Boolean)
export const categorySchema = z.object({ id, name: z.string(), slug: z.string() })
const namedSchema = z.object({ id, name: z.string() })
const processingSchema = z.object({
  id,
  processing_type_id: id,
  processing_cost: amount,
  processing_type: namedSchema.nullable(),
})
const saleSchema = z.object({
  sale_price: amount,
  quantity: amount,
  quantity_sold: amount,
  start_date: z.string().nullish(),
  end_date: z.string().nullish(),
  status: z.string(),
})
export const unitVariantSchema = z.object({
  id,
  status: z.string(),
  is_default: flag.optional().default(false),
  selling_price: amount.nullable(),
  minimum_order_quantity: amount.nullish(),
  unit: namedSchema.nullable(),
  custom_pricing: z
    .array(z.object({ selling_price: amount, company_id: id }))
    .optional()
    .default([]),
  processing_variants: z.array(processingSchema).optional().default([]),
  flash_sale: saleSchema.nullish(),
})
export const gradeVariantSchema = z.object({
  id,
  status: z.string(),
  is_default: flag.optional().default(false),
  grade: namedSchema.nullable(),
  sku: z.string().nullish(),
  short_description: z.string().nullish(),
  description: z.string().nullish(),
  media: z
    .array(z.object({ original_url: z.string().optional(), preview_url: z.string().optional() }))
    .optional()
    .default([]),
  unit_variants: z.array(unitVariantSchema),
})
export const productSchema = z.object({
  id,
  name: z.string(),
  slug: z.string(),
  published: flag,
  status: z.string(),
  category: categorySchema.nullable(),
  unit: namedSchema.nullable(),
  product_type: z.string().nullish(),
  partner_id: id.nullish(),
  sizes: z.string().nullish(),
  ripeness: z.string().nullish(),
  washed: z.string().nullish(),
  tax: z
    .object({ id: z.number().int().positive(), name: z.string().nullish(), rate: amount })
    .nullish(),
  variations: z.array(gradeVariantSchema),
})
export const favouriteSchema = z.object({
  product_id: id,
  product: z.object({ name: z.string() }).nullish(),
})
export const recommendationsSchema = z.object({
  items: z.array(
    z.object({ product_id: z.union([id, z.string().regex(/^\d+$/).transform(Number).pipe(id)]) }),
  ),
})
export type Product = z.infer<typeof productSchema>
export type Category = z.infer<typeof categorySchema>
export type GradeVariant = z.infer<typeof gradeVariantSchema>
export type UnitVariant = z.infer<typeof unitVariantSchema>
export type Favourite = z.infer<typeof favouriteSchema>
export interface ProductSelection {
  productId: number
  productUnitVariantId: number
  processingTypeId: number | null
  quantity: number
  ripeness: string | null
  size: string | null
  washed: string | null
}

export function quantityRules(unitName: string | undefined, minimum: number | null | undefined) {
  const weighed = unitName?.trim().toLowerCase() === 'kg'
  const min = minimum != null && minimum > 0 ? minimum : weighed ? 0.1 : 1
  const fractional = weighed || !Number.isInteger(min)
  return { min, step: fractional ? 0.01 : 1, maxFractionDigits: fractional ? 2 : 0 }
}
export function isValidQuantity(value: number | null, rules: ReturnType<typeof quantityRules>) {
  return (
    value !== null &&
    Number.isFinite(value) &&
    value > 0 &&
    value + 1e-8 >= rules.min &&
    Math.abs(value - Number(value.toFixed(rules.maxFractionDigits))) < 1e-8
  )
}

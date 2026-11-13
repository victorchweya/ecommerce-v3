const currency = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' })
export const formatCurrency = (value: number) => currency.format(value)

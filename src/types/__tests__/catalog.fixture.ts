export function catalogProduct(id = 1, name = 'Tomatoes') {
  return {
    id,
    name,
    slug: name.toLowerCase().replaceAll(' ', '-'),
    published: true,
    status: 'active',
    category: { id: 3, name: 'Vegetables', slug: 'vegetables' },
    unit: { id: 1, name: 'KG' },
    sizes: 'small,large',
    ripeness: 'ripe,unripe',
    washed: 'washed',
    tax: null as { id: number; name: string; rate: string } | null,
    variations: [
      {
        id: id * 10,
        status: 'active',
        is_default: true,
        grade: { id: 1, name: 'Grade 1' },
        short_description: 'Fresh produce',
        description: '<p>Fresh produce</p>',
        media: [] as { original_url: string; preview_url?: string }[],
        unit_variants: [
          {
            id: id * 100,
            status: 'active',
            is_default: 1,
            selling_price: '100.00',
            minimum_order_quantity: '0.25',
            unit: { id: 1, name: 'KG' },
            custom_pricing: [] as { company_id: number; selling_price: string }[],
            processing_variants: [
              {
                id: 5,
                processing_type_id: 9,
                processing_cost: '10.00',
                processing_type: { id: 9, name: 'Chopped' },
              },
            ],
            flash_sale: {
              sale_price: '80.00',
              quantity: '2.00',
              quantity_sold: '1.00',
              start_date: '2020-01-01T00:00:00Z',
              end_date: '2099-01-01T00:00:00Z',
              status: 'active',
            },
          },
        ],
      },
    ],
  }
}

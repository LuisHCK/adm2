import { describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/store', () => ({
    default: {
        getters: {
            store: {
                name: 'Tienda',
                address: 'Dirección',
                phone: '1234',
                legal_id: 'ABC',
            },
            currency: '$',
        },
    },
}))

import { printInvoice } from '../../../src/reports/invoice/index'
import { salesReport } from '../../../src/reports/sales-report'

const sale = {
    id: 1,
    created_at: '2024-01-02T15:04:05',
    shoppingCart: [
        {
            inventoryProduct: {
                price: 10,
                product: {
                    name: 'Café',
                    content: '500',
                    unit: 'g',
                },
            },
            quantity: 1,
            subTotal: 10,
            discount: 0,
            discounted: 0,
        },
    ],
    customer: { name: 'Cliente' },
    subTotal: 10,
    total: 10,
    sale_type: 'cash',
    pay_with: 20,
}

describe('report date rendering', () => {
    it('renders invoice dates with date-fns', () => {
        const html = printInvoice(sale)

        expect(html).toContain('02.01.2024')
        expect(html).not.toContain('Invalid date')
    })

    it('renders sales report dates with date-fns', () => {
        const html = salesReport([sale], 'Reporte de Ventas')

        expect(html).toContain('02/01/2024')
        expect(html).not.toContain('Invalid date')
    })
})

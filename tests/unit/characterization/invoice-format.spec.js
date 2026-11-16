import { describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/store', () => ({
    default: {
        getters: {
            store: {},
            currency: '$',
        },
    },
}))

vi.mock('ejs', () => ({
    render: vi.fn(() => '<html></html>'),
}))

import { invoiceFormatId } from '../../../src/reports/invoice/index'

describe('invoiceFormatId', () => {
    it('pads ids to six digits', () => {
        expect(invoiceFormatId(0)).toBe('000000')
        expect(invoiceFormatId(1)).toBe('000001')
        expect(invoiceFormatId(123456)).toBe('123456')
    })

    it('does not truncate ids longer than six digits', () => {
        expect(invoiceFormatId(1234567)).toBe('1234567')
    })
})

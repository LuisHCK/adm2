import { describe, expect, it } from 'vitest'
import { calculateCustomerDebt } from '../../../src/lib/customer-math'

describe('calculateCustomerDebt', () => {
    it('returns zero for an empty list', () => {
        expect(calculateCustomerDebt()).toBe(0)
        expect(calculateCustomerDebt([])).toBe(0)
    })

    it('adds credit sales and subtracts payments', () => {
        expect(
            calculateCustomerDebt([
                { type: 'credit', total: 100 },
                { type: 'payment', total: -30 },
            ]),
        ).toBe(70)
    })

    it('ignores cash sales', () => {
        expect(
            calculateCustomerDebt([
                { type: 'cash', total: 100 },
                { type: 'credit', total: 40 },
            ]),
        ).toBe(40)
    })

    it('never returns a negative balance', () => {
        expect(
            calculateCustomerDebt([{ type: 'payment', total: -25 }]),
        ).toBe(0)
    })

    it('accepts numeric strings', () => {
        expect(
            calculateCustomerDebt([
                { type: 'credit', total: '50.50' },
                { type: 'payment', total: '-10.25' },
            ]),
        ).toBe(40.25)
    })
})

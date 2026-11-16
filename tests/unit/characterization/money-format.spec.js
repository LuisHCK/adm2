import { describe, expect, it, vi } from 'vitest'

vi.mock('vue', () => ({
    default: {
        filter: vi.fn(),
    },
}))

vi.mock('../../../src/store', () => ({
    default: {
        getters: {
            currency: '$',
        },
    },
}))

import { formatNumber } from '../../../src/filters/money-format.filter'

describe('formatNumber', () => {
    it('formats numbers with the store currency', () => {
        expect(formatNumber(1234)).toBe('$1,234')
        expect(formatNumber(1234.5)).toBe('$1,234.50')
        expect(formatNumber('99')).toBe('$99')
    })

    it('returns the currency plus 0 for non-numeric values', () => {
        // Pins current behavior: the NaN branch interpolates `0.00`,
        // which stringifies as "0". Do not change without a behavior decision.
        expect(formatNumber('abc')).toBe('$0')
        expect(formatNumber(undefined)).toBe('$0')
    })

    it('treats null as zero', () => {
        expect(formatNumber(null)).toBe('$0')
    })
})

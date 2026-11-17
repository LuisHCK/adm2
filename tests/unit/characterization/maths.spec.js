import { describe, expect, it } from 'vitest'
import Maths from '../../../src/lib/maths'

describe('Maths', () => {
    it('calculates a percentage of a number', () => {
        expect(Maths.percentOfNum(10, 50)).toBe(5)
        expect(Maths.percentOfNum(0, 50)).toBe(0)
        expect(Maths.percentOfNum(100, 7)).toBe(7)
    })

    it('returns the percentage as a two-decimal string', () => {
        expect(Maths.getPercent(100, 10)).toBe('10.00')
        expect(Maths.getPercent(50, 7)).toBe('3.50')
        expect(Maths.getPercent(0, 10)).toBe('0.00')
    })
})

import { describe, expect, it } from 'vitest'
import { normalizeText } from '../../../src/lib/locale'
import { compareText } from '../../../src/lib/text-utils'

describe('locale helpers', () => {
    it('removes accents and diacritics', () => {
        expect(normalizeText('México')).toBe('Mexico')
        expect(normalizeText('Café Ácido')).toBe('Cafe Acido')
    })

    it('passes non-string values through unchanged', () => {
        expect(normalizeText(123)).toBe(123)
        expect(normalizeText(null)).toBe(null)
    })

    it('compares text case- and accent-insensitively', () => {
        expect(compareText('Café', 'CAFE')).toBe(true)
        expect(compareText('México', 'mex')).toBe(true)
        expect(compareText('Apple', 'Banana')).toBe(false)
    })
})

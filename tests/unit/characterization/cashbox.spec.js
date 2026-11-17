import { describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/db', () => ({
    default: {
        table: () => ({}),
    },
}))

vi.mock('../../../src/store', () => ({
    default: {
        getters: {
            currency: '$',
            currentUser: { name: 'Tester' },
            store: {},
        },
    },
}))

vi.mock('../../../src/reports/generic-report', () => ({
    default: vi.fn(),
}))

vi.mock('../../../src/controllers/users', () => ({
    getUserById: vi.fn(),
}))

vi.mock('../../../src/filters/money-format.filter', () => ({
    formatNumber: value => String(value),
}))

import {
    cashBoxDateFormat,
    cashBoxRefGen,
    getLogType,
} from '../../../src/controllers/cashbox'

describe('cashbox helpers', () => {
    it('generates references by transaction type', () => {
        expect(cashBoxRefGen('sale', 'vent-1')).toBe('VENT-VENT-1')
        expect(cashBoxRefGen('close', 12)).toBe('CIER-12')
        expect(cashBoxRefGen('subtract', 3)).toBe('RETR-3')
        expect(cashBoxRefGen('balance', 4)).toBe('SALD-4')
        expect(cashBoxRefGen('other', 5)).toBe('INVL-5')
    })

    it('formats dates for references', () => {
        const date = new Date(2024, 0, 2, 3, 4, 5)
        expect(cashBoxDateFormat(date)).toBe('020124304am')
    })

    it('maps log types to labels and classes', () => {
        expect(getLogType('add')).toEqual({
            label: 'Ingreso',
            className: 'is-success',
        })
        expect(getLogType('subtract')).toEqual({
            label: 'Egreso',
            className: 'is-warning',
        })
        expect(getLogType('close')).toEqual({
            label: 'Cierre',
            className: 'is-danger',
        })
        expect(getLogType('balance')).toEqual({
            label: 'Saldo',
            className: 'is-info',
        })
        expect(getLogType('nope')).toEqual({
            label: 'Tipo inválido',
            className: 'is-dark',
        })
    })
})

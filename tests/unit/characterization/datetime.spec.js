import { describe, expect, it } from 'vitest'
import { enUS } from 'date-fns/locale'
import {
    dateToISO,
    endOfDayDate,
    enumerateDaysBetweenDates,
    formatDate,
    isDateWithin,
    lastXdays,
    startOfDayDate,
    toDate,
} from '../../../src/lib/datetime'

const ymd = date => [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
]

describe('datetime helpers', () => {
    it('returns N midnight dates, newest first', () => {
        const dates = lastXdays(3)

        expect(dates).toHaveLength(3)
        dates.forEach(date => {
            expect(date.getHours()).toBe(0)
            expect(date.getMinutes()).toBe(0)
            expect(date.getSeconds()).toBe(0)
            expect(date.getMilliseconds()).toBe(0)
        })

        expect(dates[1].getTime()).toBeLessThan(dates[0].getTime())
        expect(dates[2].getTime()).toBeLessThan(dates[1].getTime())
    })

    it('returns an inclusive range of days', () => {
        const dates = enumerateDaysBetweenDates('2024-01-01', '2024-01-03')

        expect(dates).toHaveLength(3)
        expect(dates.map(ymd)).toEqual([
            [2024, 1, 1],
            [2024, 1, 2],
            [2024, 1, 3],
        ])
    })

    it('returns an empty range when the start is after the end', () => {
        expect(enumerateDaysBetweenDates('2024-01-03', '2024-01-01')).toEqual(
            [],
        )
    })

    it('normalizes Dates, ISO strings, and timestamps', () => {
        const date = new Date(2024, 0, 2, 3, 4, 5)

        expect(toDate(date)).toBe(date)
        expect(toDate(date.toISOString()).getTime()).toBe(date.getTime())
        expect(toDate(date.getTime()).getTime()).toBe(date.getTime())
    })

    it('formats with the Spanish locale by default', () => {
        expect(formatDate(new Date(2024, 0, 2), 'dd/MM/yyyy')).toBe(
            '02/01/2024',
        )
        expect(formatDate(new Date(2024, 0, 2), 'MMM')).toBe('ene')
    })

    it('accepts a locale override', () => {
        const date = new Date(2024, 0, 2, 15, 4, 5)

        expect(
            formatDate(date, 'dd/MM/yyyy, h:mm a', { locale: enUS }),
        ).toBe('02/01/2024, 3:04 PM')
    })

    it('returns a stable value for invalid dates', () => {
        expect(formatDate('not-a-date', 'dd/MM/yyyy')).toBe('Invalid date')
    })

    it('formats ISO strings with the local offset', () => {
        expect(dateToISO(new Date(2024, 0, 2, 3, 4, 5))).toMatch(
            /^2024-01-02T03:04:05[+-]\d{2}:\d{2}$/,
        )
    })

    it('computes start and end of day', () => {
        const start = startOfDayDate('2024-01-02T15:04:05')
        const end = endOfDayDate('2024-01-02T15:04:05')

        expect([start.getHours(), start.getMinutes()]).toEqual([0, 0])
        expect([end.getHours(), end.getMinutes()]).toEqual([23, 59])
        expect(end.getSeconds()).toBe(59)
        expect(end.getMilliseconds()).toBe(999)
    })

    it('checks inclusive date ranges without throwing on invalid input', () => {
        const start = '2024-01-02T00:00:00'
        const end = '2024-01-02T23:59:59'

        expect(isDateWithin('2024-01-02T12:00:00', start, end)).toBe(true)
        expect(isDateWithin('2024-01-03T00:00:00', start, end)).toBe(false)
        expect(isDateWithin('not-a-date', start, end)).toBe(false)
    })
})

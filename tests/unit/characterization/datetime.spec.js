import { describe, expect, it } from 'vitest'
import {
    enumerateDaysBetweenDates,
    lastXdays,
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
})

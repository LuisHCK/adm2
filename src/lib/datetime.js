import {
    eachDayOfInterval,
    endOfDay,
    format,
    formatISO,
    isWithinInterval,
    parseISO,
    startOfDay,
    subDays,
} from 'date-fns'
import { es } from 'date-fns/locale'

export const DATE_LOCALE = es

/**
 * Normalize a value into a Date instance.
 * Accepts Date objects, ISO strings, and timestamps.
 * @param {Date|string|number} value
 * @returns {Date}
 */
export function toDate(value) {
    if (value instanceof Date) {
        return value
    }

    if (typeof value === 'number') {
        return new Date(value)
    }

    if (typeof value === 'string') {
        const parsed = parseISO(value)
        if (!Number.isNaN(parsed.getTime())) {
            return parsed
        }
    }

    return new Date(value)
}

/**
 * Format a date with the Spanish locale.
 * @param {Date|string|number} value Date to format
 * @param {string} pattern date-fns format pattern
 * @param {Object} options Optional date-fns options (locale override, etc.)
 * @returns {string}
 */
export function formatDate(value, pattern, options = {}) {
    const date = toDate(value)

    if (Number.isNaN(date.getTime())) {
        return 'Invalid date'
    }

    return format(date, pattern, { locale: DATE_LOCALE, ...options })
}

/**
 * ISO-8601 string including the local offset.
 * Matches the shape previously produced by the legacy date formatter.
 * @param {Date|string|number} value
 * @returns {string}
 */
export function dateToISO(value) {
    return formatISO(toDate(value))
}

/**
 * Start of the local day.
 * @param {Date|string|number} value
 * @returns {Date}
 */
export function startOfDayDate(value) {
    return startOfDay(toDate(value))
}

/**
 * End of the local day.
 * @param {Date|string|number} value
 * @returns {Date}
 */
export function endOfDayDate(value) {
    return endOfDay(toDate(value))
}

/**
 * Inclusive date-range check. Returns false for invalid dates instead of throwing.
 * @param {Date|string|number} value
 * @param {Date|string|number} start
 * @param {Date|string|number} end
 * @returns {boolean}
 */
export function isDateWithin(value, start, end) {
    const date = toDate(value)
    const from = toDate(start)
    const to = toDate(end)

    if ([date, from, to].some(item => Number.isNaN(item.getTime()))) {
        return false
    }

    return isWithinInterval(date, { start: from, end: to })
}

/**
 * Get an array with the latest N days, newest first, at local midnight.
 * @param {Number} n N quantity of days
 * @returns Array<Date>
 */
export function lastXdays(n) {
    const today = startOfDay(new Date())

    return Array.from({ length: n }, (_, index) => subDays(today, index))
}

/**
 * Set a date to the start or end of the day.
 * @param {Date|string|number} date Date to adjust
 * @param {'start'|'end'} time Boundary to use
 * @returns {Date}
 */
export function setHourTo(date, time) {
    return time === 'start'
        ? startOfDay(toDate(date))
        : endOfDay(toDate(date))
}

/**
 * Get an inclusive array of days between two dates.
 * @param {Date|string|number} startDate
 * @param {Date|string|number} endDate
 * @returns Array<Date>
 */
export function enumerateDaysBetweenDates(startDate, endDate) {
    const start = toDate(startDate)
    const end = toDate(endDate)

    if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime()) ||
        start > end
    ) {
        return []
    }

    return eachDayOfInterval({ start, end })
}

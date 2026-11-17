import { toRaw } from 'vue'

/**
 * Deep-unwrap a Vue reactive value into a plain, structured-cloneable object.
 * IndexedDB rejects Proxy objects, so every Dexie write from a Vue form must
 * pass through this helper.
 *
 * @param {*} value
 * @returns {*}
 */
export function toPlain(value) {
    if (value === null || value === undefined) {
        return value
    }

    const raw = toRaw(value)

    if (typeof raw !== 'object') {
        return raw
    }

    return JSON.parse(JSON.stringify(raw))
}

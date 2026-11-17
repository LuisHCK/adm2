import database from '../db'
import { toPlain } from '../lib/serialization'

/**
 * @typedef SettingItem
 * @type {Object}
 * @property {string} name Setting key name
 * @property {any} value Setting value
 */

/**
 * Creates a new setting
 * @param {SettingItem} data Settings object
 * @returns {Promise}
 */
export const createSettings = data => {
    return database.settings.add(toPlain(data))
}

export const loadSettings = async () => {
    return await database.settings.get({ name: 'store' })
}

export const getSettings = async name => {
    try {
        return await database.settings.get({ name })
    } catch (error) {
        console.error(error)
        return {}
    }
}

/**
 * Update or create settings value
 * @param {SettingItem} data
 * @returns {void}
 */
export const addOrUpdateSettings = async data => {
    const existingSetting = await database.settings.get({ name: data.name })

    if (existingSetting && existingSetting.id) {
        await database.settings.update(existingSetting.id, {
            value: toPlain(data.value),
        })
    } else {
        await database.settings.add(toPlain(data))
    }
}

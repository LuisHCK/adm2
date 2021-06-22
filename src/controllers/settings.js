import database from '../db'

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
    return database.settings.add(data)
}

export const loadSettings = async () => {
    return await database.settings.get({ name: 'store' })
}

export const getSettings = async name => {
    return await database.settings.get({ name })
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
            value: data.value
        })
    } else {
        await database.settings.add(data)
    }
}

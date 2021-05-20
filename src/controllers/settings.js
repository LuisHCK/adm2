import database from '../db'

/**
 * Creates a new setting
 * @param {{name: string, value: any}} data Settings object
 * @returns {Promise}
 */
export const createSettings = data => {
    return Database.settings.add(data)
}

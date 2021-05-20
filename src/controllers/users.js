import database from '../db'
import { hashSync } from '../lib/auth'

/**
 * Register a new user
 * @param {*} data User data
 * @returns {Promise}
 */
export const registerUser = async data => {
    let payload = { ...data }
    payload.password_digest = hashSync(payload.password)
    delete payload.password

    const userId = await database.user.add(payload)
    return await database.user.get(userId)
}

/**
 * Find user by ID
 * @param {*} userId User id
 * @returns {Promise}
 */
export const getUserById = async userId => {
    return await database.user.get(userId)
}

/**
 * Get the total users in db
 * @returns {Promise<number>} Promise with total of users
 */
export const getTotalUsers = async () => {
    return await database.user.count()
}

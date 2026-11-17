import database from '../db'
import { hashSync } from '../lib/auth'
import { toPlain } from '../lib/serialization'

const duplicateUserError = () => {
    const error = new Error(
        'El nombre de usuario o el correo ya están registrados',
    )
    error.code = 'DUPLICATE_USER'
    return error
}

/**
 * Register a new user
 * @param {*} data User data
 * @returns {Promise}
 */
export const registerUser = async data => {
    const username = data.username ? String(data.username).trim() : ''
    const email = data.email ? String(data.email).trim() : ''

    if (username) {
        const existingUsername = await database.user
            .where('username')
            .equalsIgnoreCase(username)
            .first()

        if (existingUsername) {
            throw duplicateUserError()
        }
    }

    if (email) {
        const existingEmail = await database.user
            .where('email')
            .equalsIgnoreCase(email)
            .first()

        if (existingEmail) {
            throw duplicateUserError()
        }
    }

    const payload = toPlain({ ...data, username, email })
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

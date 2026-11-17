import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import database from '../../../src/db'
import { registerUser, getTotalUsers } from '../../../src/controllers/users'
import { logIn } from '../../../src/lib/auth'
import { pinia, useAppStore } from '../../../src/store'

const baseUser = {
    name: 'Admin',
    username: 'admin',
    email: 'admin@example.com',
    password: 'secret123',
    company_name: 'Tienda Test',
}

beforeAll(async () => {
    await database.open()
    await database.delete()
    await database.open()
})

afterAll(async () => {
    useAppStore(pinia).LOGOUT()
    await database.delete()
})

describe('auth flow', () => {
    it('registers the first user with a bcrypt digest', async () => {
        const user = await registerUser(baseUser)

        expect(user.username).toBe('admin')
        expect(user.password).toBeUndefined()
        expect(user.password_digest).toMatch(/^\$2[aby]\$/)
        expect(await getTotalUsers()).toBe(1)
    })

    it('rejects a duplicate username', async () => {
        await expect(
            registerUser({
                ...baseUser,
                username: 'ADMIN',
                email: 'other@example.com',
            }),
        ).rejects.toMatchObject({ code: 'DUPLICATE_USER' })
    })

    it('rejects a duplicate email', async () => {
        await expect(
            registerUser({
                ...baseUser,
                username: 'other',
                email: 'ADMIN@EXAMPLE.COM',
            }),
        ).rejects.toMatchObject({ code: 'DUPLICATE_USER' })
    })

    it('rejects a wrong password', async () => {
        expect(await logIn('admin', 'wrong-password')).toBe(false)
    })

    it('logs in by username, case-insensitively', async () => {
        expect(await logIn('ADMIN', 'secret123')).toBe(true)
        expect(useAppStore(pinia).user.username).toBe('admin')
    })

    it('logs in by email', async () => {
        useAppStore(pinia).LOGOUT()
        expect(await logIn('admin@example.com', 'secret123')).toBe(true)
        expect(useAppStore(pinia).isAuthenticated).toBe(true)
    })

    it('clears the session on logout', () => {
        useAppStore(pinia).LOGOUT()

        expect(useAppStore(pinia).user).toBeUndefined()
        expect(useAppStore(pinia).isAuthenticated).toBe(false)
    })
})

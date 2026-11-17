import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import database from '../../../src/db'

/**
 * `tests/fixtures/legacy-backup-v1.json` was produced by the Vue 2 build
 * itself: Dexie 3.2.2 + dexie-export-import 1.0.0, exporting the unchanged
 * `adm_2` v0.1 schema. It is the closest thing to a real user backup we can
 * commit, and it pins the upgrade path across the library major version.
 */
const fixturePath = fileURLToPath(
    new URL('../../fixtures/legacy-backup-v1.json', import.meta.url),
)

const TABLE_COUNTS = {
    user: 1,
    provider: 1,
    customer: 1,
    settings: 3,
    product: 2,
    product_provider: 1,
    inventory: 1,
    inventory_product: 2,
    tax: 1,
    coupon: 1,
    sale: 2,
    route: 1,
    customer_payment: 1,
    cash_box: 2,
}

describe('legacy Vue 2 backup import', () => {
    let dump

    beforeAll(async () => {
        const text = readFileSync(fixturePath, 'utf8')
        dump = JSON.parse(text)

        const { importInto } = await import('dexie-export-import')
        await database.open()
        await database.delete()
        await database.open()
        await importInto(
            database,
            new Blob([text], { type: 'application/json' }),
            { overwriteValues: true, clearTablesBeforeImport: true },
        )
    })

    it('is a format-version-1 Dexie dump from the old library', () => {
        expect(dump.formatName).toBe('dexie')
        expect(dump.formatVersion).toBe(1)
        expect(dump.data.databaseName).toBe('adm_2')
        expect(dump.data.tables).toHaveLength(Object.keys(TABLE_COUNTS).length)
    })

    it('imports every legacy table with matching row counts', async () => {
        for (const [table, count] of Object.entries(TABLE_COUNTS)) {
            expect(await database.table(table).count(), table).toBe(count)
        }
    })

    it('preserves the owner account for login', async () => {
        const user = await database.user
            .where('username')
            .equals('admin')
            .first()

        expect(user).toBeDefined()
        expect(user.name).toBe('Admin Heredado')
        expect(user.role).toBe('admin')
        expect(user.password).toMatch(/^\$2a\$/)
    })

    it('preserves settings and store identity', async () => {
        const store = await database.settings
            .where('name')
            .equals('store')
            .first()

        expect(store.value).toBe('Tienda Heredada')
        expect(store.active).toBe(true)
    })

    it('preserves products, barcodes, and provider links', async () => {
        const product = await database.product
            .where('codebar')
            .equals('LEGACY-001')
            .first()

        expect(product.name).toBe('Café Heredado')
        expect(product.brand).toBe('Marca Vieja')
        expect(product.providers).toHaveLength(1)

        const link = await database.product_provider
            .where('product_id')
            .equals(product.id)
            .first()
        expect(link.active).toBe(true)
    })

    it('preserves inventory stock and prices', async () => {
        const product = await database.product
            .where('codebar')
            .equals('LEGACY-001')
            .first()
        const stock = await database.inventory_product
            .where('product_id')
            .equals(product.id)
            .first()

        expect(stock.price).toBe(12.5)
        expect(stock.stock).toBe(8)
        expect(stock.unlimited_stock).toBe(false)
    })

    it('preserves sales, credit customers, and cashbox entries', async () => {
        const sales = await database.sale.toArray()
        expect(sales.map(sale => sale.sale_type).sort()).toEqual([
            'cash',
            'credit',
        ])

        const creditSale = sales.find(sale => sale.sale_type === 'credit')
        const customer = await database.customer.get(creditSale.customer_id)
        expect(customer.name).toBe('Cliente Heredado')

        const cashbox = await database.cash_box.toArray()
        const income = cashbox.reduce((total, row) => total + row.amount, 0)
        expect(income).toBe(34)

        const payment = await database.customer_payment.toArray()
        expect(payment[0].balance).toBe(5)
    })
})

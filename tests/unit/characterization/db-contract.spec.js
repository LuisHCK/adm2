import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import database, { Product, User } from '../../../src/db'

const NOW = '2024-01-01T00:00:00.000Z'
const ids = {}

const searchProducts = term =>
    database.product
        .where('name')
        .startsWithIgnoreCase(term)
        .or('brand')
        .startsWithIgnoreCase(term)
        .or('codebar')
        .startsWithIgnoreCase(term)
        .toArray()

beforeAll(async () => {
    await database.open()
    await database.delete()
    await database.open()

    ids.user = await database.user.add({
        name: 'Admin',
        email: 'admin@example.com',
        username: 'admin',
        role: 'admin',
        created_at: NOW,
        updated_at: NOW,
    })

    ids.provider = await database.provider.add({
        name: 'Proveedor',
        email: 'provider@example.com',
        phone_number: '1111',
        created_at: NOW,
        updated_at: NOW,
    })

    ids.customer = await database.customer.add({
        name: 'Cliente',
        email: 'customer@example.com',
        phone_number: '2222',
        created_at: NOW,
        updated_at: NOW,
    })

    await database.settings.add({
        name: 'store',
        value: { name: 'Tienda', currency: '$' },
        active: true,
    })

    ids.product = await database.product.add({
        name: 'Café',
        description: 'Molido',
        brand: 'Marca',
        codebar: '123456',
        user_id: ids.user,
        providers: [ids.provider],
        created_at: NOW,
        updated_at: NOW,
    })

    ids.product2 = await database.product.add({
        name: 'Té',
        description: 'Negro',
        brand: 'Otra',
        codebar: '999999',
        user_id: ids.user,
        providers: [],
        created_at: NOW,
        updated_at: NOW,
    })

    await database.product_provider.add({
        product_id: ids.product,
        provider_id: ids.provider,
        active: true,
        user_id: ids.user,
        created_at: NOW,
        updated_at: NOW,
    })

    ids.inventory = await database.inventory.add({
        name: 'Principal',
        location: 'Centro',
        user_id: ids.user,
        created_at: NOW,
        updated_at: NOW,
    })

    ids.inventoryProduct = await database.inventory_product.add({
        product_id: ids.product,
        inventory_id: ids.inventory,
        price: 10,
        lot: 'L1',
        stock: 5,
        unlimited_stock: false,
        created_at: NOW,
        updated_at: NOW,
    })

    await database.tax.add({
        name: 'IVA',
        amount: 12,
        user_id: ids.user,
        created_at: NOW,
        updated_at: NOW,
    })

    await database.coupon.add({
        name: 'Promo',
        amount: 5,
        created_at: NOW,
        updated_at: NOW,
    })

    ids.sale = await database.sale.add({
        inventory_product_id: ids.inventoryProduct,
        quantity: 1,
        user_id: ids.user,
        customer_id: ids.customer,
        sale_type: 'cash',
        created_at: NOW,
        updated_at: NOW,
    })

    await database.route.add({
        name: 'Ruta 1',
        description: '',
        phone: '',
        created_at: NOW,
        updated_at: NOW,
    })

    await database.customer_payment.add({
        amount: 5,
        balance: 0,
        customer_id: ids.customer,
        created_at: NOW,
        updated_at: NOW,
    })

    await database.cash_box.add({
        amount: 10,
        concept: 'Venta POS',
        type: 'add',
        reference: 'VENT-000001',
        notes: '',
        date: NOW,
        user_id: ids.user,
        created_at: NOW,
        updated_at: NOW,
    })
})

afterAll(async () => {
    await database.delete()
})

describe('IndexedDB contract', () => {
    it('defines every v0.1 table', () => {
        const names = database.tables.map(table => table.name).sort()

        expect(names).toEqual(
            [
                'cash_box',
                'coupon',
                'customer',
                'customer_payment',
                'inventory',
                'inventory_product',
                'product',
                'product_provider',
                'provider',
                'route',
                'sale',
                'settings',
                'tax',
                'user',
            ].sort(),
        )
    })

    it('keeps the indexes the controllers depend on', () => {
        const indexes = name =>
            database
                .table(name)
                .schema.indexes.map(index => index.name)
                .sort()

        expect(indexes('product')).toEqual(
            [
                'brand',
                'codebar',
                'created_at',
                'description',
                'name',
                'providers',
                'updated_at',
                'user_id',
            ].sort(),
        )
        expect(indexes('sale')).toEqual(
            [
                'created_at',
                'customer_id',
                'inventory_product_id',
                'quantity',
                'refund_type',
                'sale_type',
                'updated_at',
                'user_id',
                '[customer_id+sale_type]',
            ].sort(),
        )
    })

    it('exposes the defineClass models', () => {
        expect(typeof User).toBe('function')
        expect(typeof Product).toBe('function')
    })

    it('enforces unique product barcodes and setting names', async () => {
        await expect(
            database.product.add({
                name: 'Duplicado',
                codebar: '123456',
                created_at: NOW,
                updated_at: NOW,
            }),
        ).rejects.toMatchObject({ name: 'ConstraintError' })

        await expect(
            database.settings.add({
                name: 'store',
                value: {},
            }),
        ).rejects.toMatchObject({ name: 'ConstraintError' })
    })

    it('supports the auth username/email lookup', async () => {
        const user = await database.user
            .where('username')
            .equalsIgnoreCase('ADMIN')
            .or('email')
            .equalsIgnoreCase('ADMIN@EXAMPLE.COM')
            .first()

        expect(user.id).toBe(ids.user)
    })

    it('supports product search by name, brand, and barcode', async () => {
        expect((await searchProducts('caf')).map(p => p.id)).toEqual([
            ids.product,
        ])
        expect((await searchProducts('MAR')).map(p => p.id)).toEqual([
            ids.product,
        ])
        expect((await searchProducts('999')).map(p => p.id)).toEqual([
            ids.product2,
        ])
    })

    it('supports settings lookup by name', async () => {
        const setting = await database.settings.get({ name: 'store' })

        expect(setting.value.currency).toBe('$')
    })

    it('supports sale filters and the compound customer/type index', async () => {
        const cashSales = await database.sale
            .where({ sale_type: 'cash' })
            .reverse()
            .toArray()

        expect(cashSales.map(sale => sale.id)).toEqual([ids.sale])

        const compound = await database.sale
            .where('[customer_id+sale_type]')
            .equals([ids.customer, 'cash'])
            .toArray()

        expect(compound.map(sale => sale.id)).toEqual([ids.sale])
    })

    it('supports inventory product lookup by product and inventory', async () => {
        const row = await database.inventory_product
            .filter(item => item.product_id === ids.product)
            .and(item => item.inventory_id === ids.inventory)
            .first()

        expect(row.id).toBe(ids.inventoryProduct)
        expect(row.stock).toBe(5)
    })

    it('supports customer payment lookup by customer', async () => {
        const payments = await database.customer_payment
            .where('customer_id')
            .equals(ids.customer)
            .toArray()

        expect(payments).toHaveLength(1)
        expect(payments[0].amount).toBe(5)
    })

    it('supports the cashbox close lookup', async () => {
        expect(
            await database.cash_box.where('type').equals('close').last(),
        ).toBeUndefined()

        await database.cash_box.add({
            amount: 0,
            concept: 'Cierre',
            type: 'close',
            reference: 'CIER-1',
            notes: '',
            date: '2024-01-02T00:00:00.000Z',
            user_id: ids.user,
            created_at: NOW,
            updated_at: NOW,
        })

        const close = await database.cash_box
            .where('type')
            .equals('close')
            .last()

        expect(close.reference).toBe('CIER-1')
    })

    it('supports primary-key reads and counts', async () => {
        expect((await database.product.get(ids.product)).name).toBe('Café')
        expect(await database.user.count()).toBe(1)
    })

    it('exports a backup that can be re-imported under a new name', async () => {
        const { exportDB, importDB } = await import('dexie-export-import')

        const blob = await exportDB(database)
        const dump = JSON.parse(await blob.text())

        expect(dump.formatName).toBe('dexie')
        expect(dump.formatVersion).toBe(1)
        expect(dump.data.tables.map(table => table.name).sort()).toEqual(
            [
                'cash_box',
                'coupon',
                'customer',
                'customer_payment',
                'inventory',
                'inventory_product',
                'product',
                'product_provider',
                'provider',
                'route',
                'sale',
                'settings',
                'tax',
                'user',
            ].sort(),
        )

        dump.data.databaseName = 'adm_2_restore_test'

        const restored = await importDB(
            new Blob([JSON.stringify(dump)], { type: 'application/json' }),
        )

        try {
            expect(await restored.table('user').count()).toBe(1)
            expect(await restored.table('product').count()).toBe(2)
            expect(await restored.table('cash_box').count()).toBe(2)
        } finally {
            await restored.delete()
        }
    })
})

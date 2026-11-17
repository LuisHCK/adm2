import { launchBrowser } from './browser.mjs'

const baseUrl = process.env.SMOKE_URL || 'http://127.0.0.1:4173'
const browser = await launchBrowser()
const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
})
const page = await context.newPage()

const errors = []
page.on('pageerror', error => errors.push(error.stack || error.message))
page.on('console', message => {
    if (message.type() === 'error') {
        errors.push(message.text())
        console.log('[browser error]', message.text())
    }
})

const checks = []
const check = (name, value) => {
    checks.push({ name, ok: !!value })
    console.log(`[${value ? 'ok' : 'FAIL'}] ${name}`)
}

async function chooseAction(label) {
    await page.locator('.action-buttons .navbar-item').click()
    await page
        .locator('.dropdown-content .dropdown-item')
        .filter({ hasText: label })
        .first()
        .click()
}

const visibleModal = () => page.locator('.modal-card:visible').first()

async function waitModal() {
    await visibleModal().waitFor({ state: 'visible', timeout: 5000 })
}

async function waitModalClosed() {
    await page
        .locator('.modal-card:visible')
        .first()
        .waitFor({ state: 'hidden', timeout: 5000 })
}

// --- Register ---
await page.goto(`${baseUrl}/registration`, { waitUntil: 'domcontentloaded' })
await page.getByPlaceholder('Nombre y apellido').fill('Admin')
await page
    .getByPlaceholder('Nombre de usuario para inicio de sesión')
    .fill('admin')
await page.getByPlaceholder('Al menos 6 caracteres').fill('secret123')
await page.getByPlaceholder('Se mostrará en los recibos').fill('Tienda Test')
await page.getByRole('button', { name: 'Crear cuenta' }).click()
await page.waitForFunction(() => window.location.pathname === '/', null, {
    timeout: 10000,
})
console.log('[register] ok')

// --- Products: create ---
await page.goto(`${baseUrl}/products`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(800)
await chooseAction('Nuevo')
await waitModal()
await visibleModal().getByPlaceholder('Nombre del producto').fill('Producto Test')
await visibleModal().getByPlaceholder('Marca del producto').fill('Marca Test')
await visibleModal().getByPlaceholder('Unidad de medida').fill('unidad')
await page
    .getByPlaceholder('Codigo o codigo de barras')
    .fill('123456789')
await visibleModal().locator('button[type=submit]').click()
try {
    await waitModalClosed()
} catch (error) {
    console.log(
        '[debug] modal still open:',
        (await page.locator('body').innerText()).slice(-500),
    )
    console.log('[debug] errors:', errors)
    throw error
}
await page.waitForTimeout(500)

let productRow = page
    .locator('tbody tr')
    .filter({ hasText: 'Producto Test' })
check('product created', (await productRow.count()) === 1)

// --- Products: search ---
await page.getByPlaceholder('Nombre, marca, codigo').fill('123456789')
await page.waitForTimeout(700)
productRow = page
    .locator('tbody tr')
    .filter({ hasText: 'Producto Test' })
check('product search by barcode', (await productRow.count()) === 1)

await page.getByPlaceholder('Nombre, marca, codigo').fill('Marca Test')
await page.waitForTimeout(700)
check(
    'product search by brand',
    (await page
        .locator('tbody tr')
        .filter({ hasText: 'Producto Test' })
        .count()) === 1,
)

await page.getByPlaceholder('Nombre, marca, codigo').fill('')
await page.waitForTimeout(700)

// --- Products: edit ---
productRow = page
    .locator('tbody tr')
    .filter({ hasText: 'Producto Test' })
await productRow.locator('button').nth(0).click()
await waitModal()
await visibleModal().getByPlaceholder('Nombre del producto').fill('Producto Editado')
await visibleModal().locator('button[type=submit]').click()
await waitModalClosed()
await page.waitForTimeout(500)
check(
    'product edited',
    (await page
        .locator('tbody tr')
        .filter({ hasText: 'Producto Editado' })
        .count()) === 1,
)

// --- Products: duplicate barcode ---
await chooseAction('Nuevo')
await waitModal()
await visibleModal().getByPlaceholder('Nombre del producto').fill('Producto Duplicado')
await visibleModal().getByPlaceholder('Marca del producto').fill('Marca Test')
await visibleModal().getByPlaceholder('Unidad de medida').fill('unidad')
await page
    .getByPlaceholder('Codigo o codigo de barras')
    .fill('123456789')
await visibleModal().locator('button[type=submit]').click()
await page.waitForTimeout(1000)
check(
    'duplicate barcode rejected',
    (await page.getByText('Error al guardar').count()) === 1 &&
        (await page
            .getByText('El código de barras que indicó ya está siendo usando')
            .count()) === 1,
)
await page.getByRole('button', { name: 'OK' }).click()
await page.keyboard.press('Escape')
await page.waitForTimeout(800)

// --- Products: delete ---
await page.waitForTimeout(300)
productRow = page
    .locator('tbody tr')
    .filter({ hasText: 'Producto Editado' })
await productRow.locator('button').nth(2).click()
await page.getByRole('button', { name: 'Sí, eliminar' }).click()
await page.waitForTimeout(700)
check(
    'product deleted',
    (await page
        .locator('tbody tr')
        .filter({ hasText: 'Producto Editado' })
        .count()) === 0,
)

// --- Providers: validation, create, edit, delete ---
await page.goto(`${baseUrl}/providers`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(800)
await chooseAction('Nuevo Proveedor')
await waitModal()
await visibleModal().locator('button[type=submit]').click()
await page.waitForTimeout(500)
check(
    'provider required validation',
    (await page.getByText('Este campo es obligatorio').count()) > 0,
)
await visibleModal().getByPlaceholder('Nombre del Proveedor').fill('Proveedor Test')
await visibleModal().locator('button[type=submit]').click()
await waitModalClosed()
await page.waitForTimeout(500)

let providerRow = page
    .locator('tbody tr')
    .filter({ hasText: 'Proveedor Test' })
check('provider created', (await providerRow.count()) === 1)

await providerRow.locator('button').nth(0).click()
await waitModal()
await visibleModal().getByPlaceholder('Nombre del Proveedor').fill('Proveedor Editado')
await visibleModal().locator('button[type=submit]').click()
await waitModalClosed()
await page.waitForTimeout(500)
check(
    'provider edited',
    (await page
        .locator('tbody tr')
        .filter({ hasText: 'Proveedor Editado' })
        .count()) === 1,
)

await page
    .locator('tbody tr')
    .filter({ hasText: 'Proveedor Editado' })
    .locator('button')
    .nth(1)
    .click()
await page.getByRole('button', { name: 'Sí, eliminar' }).click()
await page.waitForTimeout(700)
check(
    'provider deleted',
    (await page
        .locator('tbody tr')
        .filter({ hasText: 'Proveedor Editado' })
        .count()) === 0,
)

// --- Customers: create, payment, balance ---
await page.goto(`${baseUrl}/customers`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(800)
await chooseAction('Nuevo Cliente')
await waitModal()
await visibleModal().getByPlaceholder('Nombre del cliente').fill('Cliente Test')
await visibleModal().getByPlaceholder('Número de teléfono').fill('555-0000')
await visibleModal().getByPlaceholder('Correo electrónico').fill('cliente@example.com')
await visibleModal().getByPlaceholder('Domicilio del cliente').fill('Calle 1')
await visibleModal().locator('button[type=submit]').click()
await waitModalClosed()
await page.waitForTimeout(700)

const customerRow = page
    .locator('tbody tr')
    .filter({ hasText: 'Cliente Test' })
check('customer created', (await customerRow.count()) === 1)

await customerRow.locator('button').first().click()
await page.waitForTimeout(800)
check(
    'customer detail opened',
    page.url().includes('/customers/') &&
        (await page.getByText('Cliente Test').count()) > 0,
)

await chooseAction('Registrar Pago')
await waitModal()
await visibleModal().getByPlaceholder('Monto pagado').fill('10')
await visibleModal().locator('button[type=submit]').click()
await page.getByRole('button', { name: 'Si, guardar pago' }).click()
await page.waitForTimeout(1000)

await page.goto(`${baseUrl}/customers`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(900)
const paidRow = page.locator('tbody tr').filter({ hasText: 'Cliente Test' })
const tags = await paidRow.locator('.tag').allInnerTexts()
console.log('[customer] tags=', JSON.stringify(tags))
check('payment recorded', tags.some(text => text.includes('10')))
check('balance clamped at zero', tags.some(text => text.includes('$0')))

console.log('\n--- errors ---')
console.log(errors.length ? errors.join('\n') : 'none')

await browser.close()

if (errors.length || checks.some(item => !item.ok)) {
    process.exitCode = 1
}

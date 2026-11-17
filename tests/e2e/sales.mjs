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
    if (message.type() === 'error') errors.push(message.text())
})

const checks = []
const check = (name, value) => {
    checks.push({ name, ok: !!value })
    console.log(`[${value ? 'ok' : 'FAIL'}] ${name}`)
}

const visibleModal = () => page.locator('.modal-card:visible').first()

async function chooseAction(label) {
    await page.locator('.action-buttons .navbar-item').click()
    await page
        .locator('.dropdown-content .dropdown-item')
        .filter({ hasText: label })
        .first()
        .click()
}

async function waitModal() {
    await visibleModal().waitFor({ state: 'visible', timeout: 5000 })
}

async function waitModalClosed() {
    await page
        .locator('.modal-card:visible')
        .first()
        .waitFor({ state: 'hidden', timeout: 5000 })
}

async function createProduct(name, brand, codebar) {
    await page.goto(`${baseUrl}/products`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(700)
    await chooseAction('Nuevo')
    await waitModal()
    await visibleModal().getByPlaceholder('Nombre del producto').fill(name)
    await visibleModal().getByPlaceholder('Marca del producto').fill(brand)
    await visibleModal().getByPlaceholder('Unidad de medida').fill('unidad')
    await visibleModal()
        .getByPlaceholder('Codigo o codigo de barras')
        .fill(codebar)
    await visibleModal().locator('button[type=submit]').click()
    await waitModalClosed()
    await page.waitForTimeout(400)
}

async function addProductToCart(name) {
    await page.locator('#searchInput input').fill(name)
    await page.waitForTimeout(700)
    await page
        .locator('.search-result li')
        .filter({ hasText: name })
        .first()
        .click()
    await page.waitForTimeout(400)
}

async function closeReceipt() {
    await visibleModal().locator('.modal-card-head .delete').click()
    await page.waitForTimeout(500)
}

async function selectCustomer() {
    await page.getByPlaceholder('Buscar cliente').fill('Cliente Ventas')
    await page.waitForTimeout(700)
    await page
        .locator('.autocomplete .dropdown-item')
        .filter({ hasText: 'Cliente Ventas' })
        .first()
        .click()
    await page.waitForTimeout(300)
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

// --- Products ---
await createProduct('Venta A', 'Marca A', 'VENT-A')
await createProduct('Venta B', 'Marca B', 'VENT-B')

// --- Inventory + stock ---
await page.goto(`${baseUrl}/inventories`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(700)
await chooseAction('Nuevo Inventario')
await waitModal()
await visibleModal().getByPlaceholder('Nombre del producto').fill('Ventas Inv')
await visibleModal().getByPlaceholder("Ej. 'Almacen', 'Bodega'").fill('Bodega')
await visibleModal().locator('button[type=submit]').click()
await waitModalClosed()
await page.waitForTimeout(600)
await page.getByText('Ventas Inv').first().click()
await page.waitForURL(/\/inventories\/\d+/, { timeout: 5000 })
await page.waitForTimeout(600)
const inventoryId = page.url().split('/').pop()

await chooseAction('Importar productos')
await page.waitForURL(/\/products\?selectedInventory=/, { timeout: 5000 })
await page.waitForTimeout(900)
for (const name of ['Venta A', 'Venta B']) {
    await page
        .locator('tbody tr')
        .filter({ hasText: name })
        .locator('.checkbox')
        .click()
    await page.waitForTimeout(200)
}
await chooseAction('Agregar al inventario')
await waitModal()
const importRows = visibleModal().locator('tbody tr')
await importRows.nth(0).locator('input[type=number]').nth(0).fill('5')
await importRows.nth(0).locator('input[type=number]').nth(1).fill('10')
await importRows.nth(1).locator('input[type=number]').nth(0).fill('5')
await importRows.nth(1).locator('input[type=number]').nth(1).fill('5')
await visibleModal().getByRole('button', { name: 'Guardar' }).click()
await page.getByRole('button', { name: 'Si, guardar' }).click()
await page.waitForTimeout(1200)
console.log('[setup] inventory stocked')

// --- Customer ---
await page.goto(`${baseUrl}/customers`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(700)
await chooseAction('Nuevo Cliente')
await waitModal()
await visibleModal().getByPlaceholder('Nombre del cliente').fill('Cliente Ventas')
await visibleModal().getByPlaceholder('Número de teléfono').fill('555-2222')
await visibleModal()
    .getByPlaceholder('Correo electrónico')
    .fill('ventas@example.com')
await visibleModal().locator('button[type=submit]').click()
await waitModalClosed()
await page.waitForTimeout(600)

// --- POS cash sale: A x2 (10) + B x1 (5) = 25 ---
await page.goto(`${baseUrl}/pos`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(800)
await addProductToCart('Venta A')
await addProductToCart('Venta B')
const quantities = page.locator('.quantity-input')
await quantities.nth(0).fill('2')
await page.waitForTimeout(300)
await selectCustomer()
await page.getByRole('button', { name: /COMPLETAR VENTA/ }).click()
await page.waitForTimeout(1400)
await closeReceipt()

// --- POS credit sale: A x1 = 10 ---
await page.goto(`${baseUrl}/pos`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(800)
await addProductToCart('Venta A')
await page
    .locator('.b-radio.radio.button')
    .filter({ hasText: 'Crédito' })
    .click()
await selectCustomer()
await page.getByRole('button', { name: /COMPLETAR VENTA/ }).click()
await page.waitForTimeout(1400)
await closeReceipt()

// --- Sales list, filters, details ---
await page.goto(`${baseUrl}/sales`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1200)
let body = await page.locator('body').innerText()
check('sales list has two sales', body.includes('000001') && body.includes('000002'))
check('sales total is 35', body.includes('$35'))

await page.locator('.filter-controls select').first().selectOption('credit')
await page.waitForTimeout(700)
check(
    'payment filter credit',
    (await page.locator('tbody tr').filter({ hasText: '000002' }).count()) === 1,
)
await page.locator('.filter-controls select').first().selectOption('cash')
await page.waitForTimeout(700)
check(
    'payment filter cash',
    (await page.locator('tbody tr').filter({ hasText: '000001' }).count()) === 1,
)
await page
    .locator('.filter-controls select')
    .first()
    .selectOption({ index: 0 })
await page.waitForTimeout(700)

await page.getByPlaceholder('Numero de venta, cliente').fill('2')
await page.waitForTimeout(700)
check(
    'search by sale id',
    (await page.locator('tbody tr').filter({ hasText: '000002' }).count()) === 1,
)
await page.getByPlaceholder('Numero de venta, cliente').fill('')
await page.waitForTimeout(700)

// --- Sale details + invoice print ---
let cashRow = page.locator('tbody tr').filter({ hasText: '000001' })
await cashRow.locator('button').nth(0).click()
await page.waitForTimeout(600)
check(
    'sale details render',
    (await visibleModal().innerText()).includes('Factura de venta') &&
        (await visibleModal().innerText()).includes('Venta A'),
)
await visibleModal().locator('.modal-card-head .delete').click()
await page.waitForTimeout(400)

const invoicePopup = page
    .waitForEvent('popup', { timeout: 6000 })
    .catch(() => null)
await cashRow.locator('button').nth(1).click()
check('invoice print opens window', !!(await invoicePopup))
const popup = await invoicePopup
if (popup) await popup.close()

// --- Report print ---
await page.goto(`${baseUrl}/sales`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(800)
const reportPopup = page
    .waitForEvent('popup', { timeout: 6000 })
    .catch(() => null)
await chooseAction('Imprimir Reporte')
check('sales report opens window', !!(await reportPopup))
const reportWindow = await reportPopup
if (reportWindow) await reportWindow.close()

// --- Partial refund of cash sale (refund Venta B) ---
await page.goto(`${baseUrl}/sales`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1000)
cashRow = page.locator('tbody tr').filter({ hasText: '000001' })
await cashRow.locator('button').nth(2).click()
await waitModal()
await visibleModal()
    .locator('tbody tr')
    .filter({ hasText: 'Venta B' })
    .locator('.checkbox')
    .click()
await visibleModal().getByRole('button', { name: 'Aceptar' }).click()
await page.waitForTimeout(1200)
cashRow = page.locator('tbody tr').filter({ hasText: '000001' })
body = await cashRow.innerText()
check('partial refund recorded', body.includes('Parcial') && body.includes('$20'))

await page.goto(`${baseUrl}/inventories/${inventoryId}`, {
    waitUntil: 'domcontentloaded',
})
await page.waitForTimeout(900)
check(
    'partial refund restores stock',
    (
        await page
            .locator('tbody tr')
            .filter({ hasText: 'Venta B' })
            .locator('.tag')
            .nth(1)
            .innerText()
    ).trim() === '5',
)

await page.goto(`${baseUrl}/cashbox`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1000)
check(
    'refund cashbox log',
    (await page.locator('body').innerText()).includes('Reembolso venta #1'),
)

// --- Full refund of cash sale (remaining Venta A) ---
await page.goto(`${baseUrl}/sales`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(900)
cashRow = page.locator('tbody tr').filter({ hasText: '000001' })
await cashRow.locator('button').nth(2).click()
await waitModal()
await visibleModal()
    .locator('tbody tr')
    .filter({ hasText: 'Venta A' })
    .locator('.checkbox')
    .click()
await visibleModal().getByRole('button', { name: 'Aceptar' }).click()
await page.waitForTimeout(1200)
cashRow = page.locator('tbody tr').filter({ hasText: '000001' })
check(
    'full refund recorded',
    (await cashRow.innerText()).includes('Completa') &&
        (await cashRow.innerText()).includes('$0'),
)

// --- Full refund of credit sale ---
const creditRow = page.locator('tbody tr').filter({ hasText: '000002' })
await creditRow.locator('button').nth(2).click()
await waitModal()
await visibleModal()
    .locator('tbody tr')
    .filter({ hasText: 'Venta A' })
    .locator('.checkbox')
    .click()
await visibleModal().getByRole('button', { name: 'Aceptar' }).click()
await page.waitForTimeout(1200)

await page.goto(`${baseUrl}/customers`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1000)
const customerRow = page
    .locator('tbody tr')
    .filter({ hasText: 'Cliente Ventas' })
const tags = await customerRow.locator('.tag').allInnerTexts()
console.log('[customer] tags=', JSON.stringify(tags))
check(
    'credit refund clears customer debt',
    tags.every(text => text.includes('$0')),
)

console.log('\n--- errors ---')
console.log(errors.length ? errors.join('\n') : 'none')

await browser.close()

if (errors.length || checks.some(item => !item.ok)) {
    process.exitCode = 1
}

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

async function addProductToCart() {
    await page.locator('#searchInput input').fill('POS Producto')
    await page.waitForTimeout(700)
    await page
        .locator('.search-result li')
        .filter({ hasText: 'POS Producto' })
        .first()
        .click()
    await page.waitForTimeout(400)
}

async function closeReceipt() {
    await visibleModal().locator('.modal-card-head .delete').click()
    await page.waitForTimeout(500)
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

// --- Create product ---
await page.goto(`${baseUrl}/products`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(800)
await chooseAction('Nuevo')
await waitModal()
await visibleModal().getByPlaceholder('Nombre del producto').fill('POS Producto')
await visibleModal().getByPlaceholder('Marca del producto').fill('Marca POS')
await visibleModal().getByPlaceholder('Unidad de medida').fill('unidad')
await visibleModal().getByPlaceholder('Codigo o codigo de barras').fill('POS-001')
await visibleModal().locator('button[type=submit]').click()
await waitModalClosed()
await page.waitForTimeout(500)

// --- Create inventory ---
await page.goto(`${baseUrl}/inventories`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(800)
await chooseAction('Nuevo Inventario')
await waitModal()
await visibleModal().getByPlaceholder('Nombre del producto').fill('POS Inventario')
await visibleModal().getByPlaceholder("Ej. 'Almacen', 'Bodega'").fill('Bodega')
await visibleModal().locator('button[type=submit]').click()
await waitModalClosed()
await page.waitForTimeout(700)
await page.getByText('POS Inventario').first().click()
await page.waitForURL(/\/inventories\/\d+/, { timeout: 5000 })
await page.waitForTimeout(700)
const inventoryId = page.url().split('/').pop()

// --- Add product to inventory with stock 5, price 10 ---
await chooseAction('Importar productos')
await page.waitForURL(/\/products\?selectedInventory=/, { timeout: 5000 })
await page.waitForTimeout(900)
await page
    .locator('tbody tr')
    .filter({ hasText: 'POS Producto' })
    .locator('.checkbox')
    .click()
await page.waitForTimeout(300)
await chooseAction('Agregar al inventario')
await waitModal()
const importRow = visibleModal().locator('tbody tr').first()
const importInputs = importRow.locator('input[type=number]')
await importInputs.nth(0).fill('5')
await importInputs.nth(1).fill('10')
await visibleModal().getByRole('button', { name: 'Guardar' }).click()
await page.getByRole('button', { name: 'Si, guardar' }).click()
await page.waitForTimeout(1200)
console.log('[setup] product stocked')

// --- Create customer ---
await page.goto(`${baseUrl}/customers`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(800)
await chooseAction('Nuevo Cliente')
await waitModal()
await visibleModal().getByPlaceholder('Nombre del cliente').fill('Cliente POS')
await visibleModal().getByPlaceholder('Número de teléfono').fill('555-1234')
await visibleModal().getByPlaceholder('Correo electrónico').fill('pos@example.com')
await visibleModal().locator('button[type=submit]').click()
await waitModalClosed()
await page.waitForTimeout(700)

// --- POS cash sale ---
await page.goto(`${baseUrl}/pos`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(900)
await addProductToCart()

const quantity = page.locator('.quantity-input').first()
await quantity.fill('10')
await page.waitForTimeout(600)
check('quantity capped at stock', (await quantity.inputValue()) === '5')
check(
    'stock warning shown',
    (await page.getByText('Supera el máximo de existencias').count()) > 0,
)

await quantity.fill('2')
await page.waitForTimeout(400)
await page.locator('.discount-input input').first().fill('10')
await page.waitForTimeout(600)
check('discount applied', (await page.getByText('$18').count()) > 0)

await page.getByPlaceholder('Buscar cliente').fill('Cliente POS')
await page.waitForTimeout(700)
await page
    .locator('.autocomplete .dropdown-item')
    .filter({ hasText: 'Cliente POS' })
    .first()
    .click()
await page.waitForTimeout(400)

await page.getByRole('button', { name: /COMPLETAR VENTA/ }).click()
await page.waitForTimeout(1400)
check(
    'cash sale receipt preview',
    (await page.getByText(/Venta #\d+/).count()) > 0 &&
        (await visibleModal().innerText()).includes('POS Producto'),
)
await closeReceipt()

// --- Verify stock, cashbox, sales ---
await page.goto(`${baseUrl}/inventories/${inventoryId}`, {
    waitUntil: 'domcontentloaded',
})
await page.waitForTimeout(1000)
check(
    'stock decremented after cash sale',
    (await page
        .locator('tbody tr')
        .filter({ hasText: 'POS Producto' })
        .innerText()).includes('3'),
)

await page.goto(`${baseUrl}/cashbox`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1200)
let cashboxText = await page.locator('body').innerText()
check(
    'cashbox log written',
    cashboxText.includes('Venta POS cont #1') && cashboxText.includes('18'),
)

await page.goto(`${baseUrl}/sales`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1200)
let salesText = await page.locator('body').innerText()
check(
    'cash sale listed',
    salesText.includes('Cliente POS') && salesText.includes('Contado'),
)

// --- POS credit sale ---
await page.goto(`${baseUrl}/pos`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(900)
await addProductToCart()
await page
    .locator('.b-radio.radio.button')
    .filter({ hasText: 'Crédito' })
    .click()
await page.getByPlaceholder('Buscar cliente').fill('Cliente POS')
await page.waitForTimeout(700)
await page
    .locator('.autocomplete .dropdown-item')
    .filter({ hasText: 'Cliente POS' })
    .first()
    .click()
await page.waitForTimeout(300)
await page.getByRole('button', { name: /COMPLETAR VENTA/ }).click()
await page.waitForTimeout(1400)
await closeReceipt()

await page.goto(`${baseUrl}/sales`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1200)
salesText = await page.locator('body').innerText()
check(
    'credit sale listed',
    salesText.includes('Crédito') && salesText.includes('Cliente POS'),
)

await page.goto(`${baseUrl}/customers`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1200)
const customerRow = page
    .locator('tbody tr')
    .filter({ hasText: 'Cliente POS' })
const customerTags = await customerRow.locator('.tag').allInnerTexts()
console.log('[customer] tags=', JSON.stringify(customerTags))
check('customer credit recorded', customerTags.some(text => text.includes('$10')))

// --- Auto-print setting ---
await page.goto(`${baseUrl}/settings`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(800)
await page
    .locator('.tabs a')
    .filter({ hasText: 'Punto de venta' })
    .click()
await page.waitForTimeout(500)
await page.locator('.switch').nth(1).click()
await page.waitForTimeout(1000)
check(
    'auto-print setting saved',
    (await page.getByText('Ajustes guardados').count()) > 0,
)

await page.goto(`${baseUrl}/pos`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(900)
await addProductToCart()
const popupPromise = page
    .waitForEvent('popup', { timeout: 6000 })
    .catch(() => null)
await page.getByRole('button', { name: /COMPLETAR VENTA/ }).click()
const popup = await popupPromise
check('auto-print opens print window', !!popup)
if (popup) await popup.close()

console.log('\n--- errors ---')
console.log(errors.length ? errors.join('\n') : 'none')

await browser.close()

if (errors.length || checks.some(item => !item.ok)) {
    process.exitCode = 1
}

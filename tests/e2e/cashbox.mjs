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

// --- Product + inventory + stock ---
await page.goto(`${baseUrl}/products`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(700)
await chooseAction('Nuevo')
await waitModal()
await visibleModal().getByPlaceholder('Nombre del producto').fill('Caja Producto')
await visibleModal().getByPlaceholder('Marca del producto').fill('Marca Caja')
await visibleModal().getByPlaceholder('Unidad de medida').fill('unidad')
await visibleModal()
    .getByPlaceholder('Codigo o codigo de barras')
    .fill('CAJA-001')
await visibleModal().locator('button[type=submit]').click()
await waitModalClosed()
await page.waitForTimeout(400)

await page.goto(`${baseUrl}/inventories`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(700)
await chooseAction('Nuevo Inventario')
await waitModal()
await visibleModal().getByPlaceholder('Nombre del producto').fill('Caja Inv')
await visibleModal().getByPlaceholder("Ej. 'Almacen', 'Bodega'").fill('Bodega')
await visibleModal().locator('button[type=submit]').click()
await waitModalClosed()
await page.waitForTimeout(600)
await page.getByText('Caja Inv').first().click()
await page.waitForURL(/\/inventories\/\d+/, { timeout: 5000 })
await page.waitForTimeout(600)
const inventoryId = page.url().split('/').pop()

await chooseAction('Importar productos')
await page.waitForURL(/\/products\?selectedInventory=/, { timeout: 5000 })
await page.waitForTimeout(900)
await page
    .locator('tbody tr')
    .filter({ hasText: 'Caja Producto' })
    .locator('.checkbox')
    .click()
await page.waitForTimeout(300)
await chooseAction('Agregar al inventario')
await waitModal()
const importInputs = visibleModal()
    .locator('tbody tr')
    .first()
    .locator('input[type=number]')
await importInputs.nth(0).fill('5')
await importInputs.nth(1).fill('10')
await visibleModal().getByRole('button', { name: 'Guardar' }).click()
await page.getByRole('button', { name: 'Si, guardar' }).click()
await page.waitForTimeout(1200)
console.log('[setup] inventory stocked')

// --- POS cash sale: 2 x 10 = 20 ---
await page.goto(`${baseUrl}/pos`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(800)
await page.locator('#searchInput input').fill('Caja Producto')
await page.waitForTimeout(700)
await page
    .locator('.search-result li')
    .filter({ hasText: 'Caja Producto' })
    .first()
    .click()
await page.waitForTimeout(400)
await page.locator('.quantity-input').first().fill('2')
await page.waitForTimeout(300)
await page.getByRole('button', { name: /COMPLETAR VENTA/ }).click()
await page.waitForTimeout(1400)
await visibleModal().locator('.modal-card-head .delete').click()
await page.waitForTimeout(500)

// --- Cashbox total after sale ---
await page.goto(`${baseUrl}/cashbox`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1000)
let totalText = await page.locator('.account-total').first().innerText()
check('cashbox total after sale', totalText.includes('$20'))
check(
    'sale log listed',
    (await page.locator('tbody').innerText()).includes('Venta POS cont #1'),
)

// --- Close/balance ---
await chooseAction('Cierre de caja')
await waitModal()
await visibleModal().locator('input[type=number]').first().fill('5')
await page.waitForTimeout(400)
const balanceValue = await visibleModal().locator('input[readonly]').inputValue()
check('close balance preview', balanceValue.includes('15'))
await visibleModal().locator('textarea').fill('Cierre de prueba')
await visibleModal().getByRole('button', { name: 'Guardar' }).click()
await page.waitForTimeout(1500)
await waitModalClosed()

totalText = await page.locator('.account-total').first().innerText()
check('cashbox total after close', totalText.includes('$15'))
const logsText = await page.locator('tbody').innerText()
check(
    'close and balance logs',
    logsText.includes('Cierre de caja') && logsText.includes('Saldo en caja'),
)
check('withdrawal is negative', logsText.includes('$-5'))

// --- Search filter ---
await page.getByPlaceholder('Buscar...').fill('Cierre')
await page.waitForTimeout(900)
const filteredLogs = await page.locator('tbody').innerText()
check(
    'cashbox search filter',
    filteredLogs.includes('Cierre de caja') &&
        !filteredLogs.includes('Venta POS cont #1'),
)

// --- Report print ---
await page.goto(`${baseUrl}/cashbox`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(800)
const reportPopup = page
    .waitForEvent('popup', { timeout: 6000 })
    .catch(() => null)
await chooseAction('Imprimir Reporte')
check('cashbox report opens window', !!(await reportPopup))
const reportWindow = await reportPopup
if (reportWindow) await reportWindow.close()

console.log('\n--- errors ---')
console.log(errors.length ? errors.join('\n') : 'none')

await browser.close()

if (errors.length || checks.some(item => !item.ok)) {
    process.exitCode = 1
}

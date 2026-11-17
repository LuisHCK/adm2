import { launchBrowser } from './browser.mjs'
import { mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const baseUrl = process.env.SMOKE_URL || 'http://127.0.0.1:4173'
const shotDir = process.env.SHOT_DIR || join(tmpdir(), 'adm2-shots')
mkdirSync(shotDir, { recursive: true })

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
await visibleModal().getByPlaceholder('Nombre del producto').fill('Dash Producto')
await visibleModal().getByPlaceholder('Marca del producto').fill('Marca Dash')
await visibleModal().getByPlaceholder('Unidad de medida').fill('unidad')
await visibleModal()
    .getByPlaceholder('Codigo o codigo de barras')
    .fill('DASH-001')
await visibleModal().locator('button[type=submit]').click()
await waitModalClosed()
await page.waitForTimeout(400)

await page.goto(`${baseUrl}/inventories`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(700)
await chooseAction('Nuevo Inventario')
await waitModal()
await visibleModal().getByPlaceholder('Nombre del producto').fill('Dash Inv')
await visibleModal().getByPlaceholder("Ej. 'Almacen', 'Bodega'").fill('Bodega')
await visibleModal().locator('button[type=submit]').click()
await waitModalClosed()
await page.waitForTimeout(600)
await page.getByText('Dash Inv').first().click()
await page.waitForURL(/\/inventories\/\d+/, { timeout: 5000 })
await page.waitForTimeout(600)

await chooseAction('Importar productos')
await page.waitForURL(/\/products\?selectedInventory=/, { timeout: 5000 })
await page.waitForTimeout(900)
await page
    .locator('tbody tr')
    .filter({ hasText: 'Dash Producto' })
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

// --- Customer ---
await page.goto(`${baseUrl}/customers`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(700)
await chooseAction('Nuevo Cliente')
await waitModal()
await visibleModal().getByPlaceholder('Nombre del cliente').fill('Cliente Dash')
await visibleModal().locator('button[type=submit]').click()
await waitModalClosed()
await page.waitForTimeout(600)

// --- POS cash sale x2 ---
await page.goto(`${baseUrl}/pos`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(800)
await addProductToCart('Dash Producto')
await page.locator('.quantity-input').first().fill('2')
await page.waitForTimeout(300)
await page.getByRole('button', { name: /COMPLETAR VENTA/ }).click()
await page.waitForTimeout(1400)
await closeReceipt()

// --- POS credit sale x1 ---
await page.goto(`${baseUrl}/pos`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(800)
await addProductToCart('Dash Producto')
await page
    .locator('.b-radio.radio.button')
    .filter({ hasText: 'Crédito' })
    .click()
await page.getByRole('button', { name: /COMPLETAR VENTA/ }).click()
await page.waitForTimeout(1400)
await closeReceipt()

// --- Dashboard ---
await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1800)
let body = await page.locator('body').innerText()

check('dashboard cash total', body.includes('Dinero en caja') && body.includes('$20'))
check(
    'dashboard sales count',
    body.includes('Ventas del día') && body.includes('2'),
)
check('dashboard customers list', body.includes('Cliente Dash'))
check(
    'dashboard latest sales',
    (await page
        .locator('.card')
        .filter({ hasText: 'Últimas ventas' })
        .locator('tbody tr')
        .count()) >= 1,
)
check(
    'dashboard low stock card',
    body.includes('Productos por agotarse') && body.includes('Dash Producto'),
)

const canvas = page.locator('canvas').first()
check(
    'chart canvas rendered',
    (await canvas.count()) === 1 &&
        (await canvas.evaluate(
            element => element.width > 0 && element.height > 0,
        )),
)

await page.screenshot({ path: `${shotDir}/dashboard-chart.png`, fullPage: false })
console.log('[shot]', `${shotDir}/dashboard-chart.png`)

console.log('\n--- errors ---')
console.log(errors.length ? errors.join('\n') : 'none')

await browser.close()

if (errors.length || checks.some(item => !item.ok)) {
    process.exitCode = 1
}

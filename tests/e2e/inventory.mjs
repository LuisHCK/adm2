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

// --- Create a product to stock ---
await page.goto(`${baseUrl}/products`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(800)
await chooseAction('Nuevo')
await waitModal()
await visibleModal().getByPlaceholder('Nombre del producto').fill('Inventario Producto')
await visibleModal().getByPlaceholder('Marca del producto').fill('Marca Inv')
await visibleModal().getByPlaceholder('Unidad de medida').fill('unidad')
await visibleModal().getByPlaceholder('Codigo o codigo de barras').fill('INV-001')
await visibleModal().locator('button[type=submit]').click()
await waitModalClosed()
await page.waitForTimeout(500)
check(
    'product created for inventory',
    (await page
        .locator('tbody tr')
        .filter({ hasText: 'Inventario Producto' })
        .count()) === 1,
)

// --- Create inventory ---
await page.goto(`${baseUrl}/inventories`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(800)
await chooseAction('Nuevo Inventario')
await waitModal()
await visibleModal().getByPlaceholder('Nombre del producto').fill('Inventario Test')
await visibleModal().getByPlaceholder("Ej. 'Almacen', 'Bodega'").fill('Bodega')
await visibleModal().locator('button[type=submit]').click()
await waitModalClosed()
await page.waitForTimeout(700)
check(
    'inventory created',
    (await page.getByText('Inventario Test').count()) > 0,
)

await page.getByText('Inventario Test').first().click()
await page.waitForURL(/\/inventories\/\d+/, { timeout: 5000 })
await page.waitForTimeout(700)
const inventoryId = page.url().split('/').pop()
console.log('[inventory] id=', inventoryId)

// --- Bulk import from inventory detail (preselected inventory) ---
await chooseAction('Importar productos')
await page.waitForURL(/\/products\?selectedInventory=/, { timeout: 5000 })
await page.waitForTimeout(900)

const productRow = page
    .locator('tbody tr')
    .filter({ hasText: 'Inventario Producto' })
await productRow.locator('.checkbox').click()
await page.waitForTimeout(300)

await chooseAction('Agregar al inventario')
await waitModal()
const importText = await visibleModal().innerText()
check('preselected inventory shown', importText.includes('Inventario Test'))

const importRow = visibleModal().locator('tbody tr').first()
const numberInputs = importRow.locator('input[type=number]')
await numberInputs.nth(0).fill('3')
await numberInputs.nth(1).fill('10')
await visibleModal().getByRole('button', { name: 'Guardar' }).click()
await page.getByRole('button', { name: 'Si, guardar' }).click()
await page.waitForTimeout(1200)
console.log('[bulk import] saved')

// --- Verify inventory detail ---
await page.goto(`${baseUrl}/inventories/${inventoryId}`, {
    waitUntil: 'domcontentloaded',
})
await page.waitForTimeout(1000)
let row = page.locator('tbody tr').filter({ hasText: 'Inventario Producto' })
check('product added to inventory', (await row.count()) === 1)
check('inventory price shown', (await row.innerText()).includes('$10'))
check('inventory stock shown', (await row.innerText()).includes('3'))

// --- Inline stock edit ---
row = page.locator('tbody tr').filter({ hasText: 'Inventario Producto' })
await row.locator('.tag').nth(1).click()
await page.waitForTimeout(400)
await row.locator('input[type=number]').fill('4')
await row.locator('input[type=number]').press('Enter')
await page.waitForTimeout(900)
row = page.locator('tbody tr').filter({ hasText: 'Inventario Producto' })
check('inline stock edit', (await row.innerText()).includes('4'))

// --- Low stock dashboard ---
await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1500)
const dashboardText = await page.locator('body').innerText()
check(
    'low stock dashboard shows product',
    dashboardText.includes('Productos por agotarse') &&
        dashboardText.includes('Inventario Producto'),
)

// --- Unlimited stock edit ---
await page.goto(`${baseUrl}/inventories/${inventoryId}`, {
    waitUntil: 'domcontentloaded',
})
await page.waitForTimeout(900)
row = page.locator('tbody tr').filter({ hasText: 'Inventario Producto' })
await row.locator('button').first().click()
await waitModal()
await visibleModal().locator('.switch').click()
await visibleModal().locator('button[type=submit]').click()
await waitModalClosed()
await page.waitForTimeout(900)
row = page.locator('tbody tr').filter({ hasText: 'Inventario Producto' })
check('unlimited stock edit', (await row.innerText()).includes('Ilimitado'))

console.log('\n--- errors ---')
console.log(errors.length ? errors.join('\n') : 'none')

await browser.close()

if (errors.length || checks.some(item => !item.ok)) {
    process.exitCode = 1
}

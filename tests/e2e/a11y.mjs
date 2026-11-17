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

async function unlabeledButtons() {
    return page.evaluate(() =>
        Array.from(document.querySelectorAll('button'))
            .filter(button => !button.closest('.pagination'))
            .filter(button => {
                const text = (button.innerText || '').trim()
                const label =
                    button.getAttribute('aria-label') ||
                    button.getAttribute('title')

                return !text && !label
            })
            .map(button => button.outerHTML.slice(0, 100)),
    )
}

async function noHorizontalOverflow() {
    return page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    )
}

// --- Register + stock one product ---
await page.goto(`${baseUrl}/registration`, { waitUntil: 'domcontentloaded' })
await page.getByPlaceholder('Nombre y apellido').fill('Admin')
await page
    .getByPlaceholder('Nombre de usuario para inicio de sesión')
    .fill('admin')
await page.getByPlaceholder('Al menos 6 caracteres').fill('secret123')
await page.getByPlaceholder('Se mostrará en los recibos').fill('Tienda A11y')
await page.getByRole('button', { name: 'Crear cuenta' }).click()
await page.waitForFunction(() => window.location.pathname === '/', null, {
    timeout: 10000,
})

await page.goto(`${baseUrl}/products`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(700)
await chooseAction('Nuevo')
await waitModal()
await visibleModal().getByPlaceholder('Nombre del producto').fill('A11y Producto')
await visibleModal().getByPlaceholder('Marca del producto').fill('Marca A11y')
await visibleModal().getByPlaceholder('Unidad de medida').fill('unidad')
await visibleModal()
    .getByPlaceholder('Codigo o codigo de barras')
    .fill('A11Y-001')
await visibleModal().locator('button[type=submit]').click()
await waitModalClosed()
await page.waitForTimeout(400)

await page.goto(`${baseUrl}/inventories`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(700)
await chooseAction('Nuevo Inventario')
await waitModal()
await visibleModal().getByPlaceholder('Nombre del producto').fill('A11y Inv')
await visibleModal().getByPlaceholder("Ej. 'Almacen', 'Bodega'").fill('Bodega')
await visibleModal().locator('button[type=submit]').click()
await waitModalClosed()
await page.waitForTimeout(600)
await page.getByText('A11y Inv').first().click()
await page.waitForURL(/\/inventories\/\d+/, { timeout: 5000 })
await page.waitForTimeout(600)

await chooseAction('Importar productos')
await page.waitForURL(/\/products\?selectedInventory=/, { timeout: 5000 })
await page.waitForTimeout(900)
await page
    .locator('tbody tr')
    .filter({ hasText: 'A11y Producto' })
    .locator('.checkbox')
    .click()
await page.waitForTimeout(300)
await chooseAction('Agregar al inventario')
await waitModal()
const inputs = visibleModal()
    .locator('tbody tr')
    .first()
    .locator('input[type=number]')
await inputs.nth(0).fill('5')
await inputs.nth(1).fill('10')
await visibleModal().getByRole('button', { name: 'Guardar' }).click()
await page.getByRole('button', { name: 'Si, guardar' }).click()
await page.waitForTimeout(1200)
console.log('[setup] stocked')

// --- Keyboard-only POS flow ---
await page.goto(`${baseUrl}/pos`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(900)

await page.keyboard.press('Control+1')
await page.waitForTimeout(300)
check(
    'Ctrl+1 focuses POS search',
    await page.evaluate(
        () =>
            !!document.activeElement &&
            !!document.activeElement.closest('#searchInput'),
    ),
)

await page.keyboard.type('A11y Producto')
await page.waitForTimeout(700)
await page.keyboard.press('Enter')
await page.waitForTimeout(700)
check(
    'keyboard adds product to cart',
    (await page.locator('.quantity-input').count()) === 1,
)

await page.keyboard.press('Control+2')
await page.waitForTimeout(1400)
check(
    'Ctrl+2 completes sale',
    (await page.getByText(/Venta #\d+/).count()) > 0,
)
await visibleModal().locator('.modal-card-head .delete').click()
await page.waitForTimeout(500)

// --- Unlabeled controls on key screens ---
await page.goto(`${baseUrl}/pos`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(700)
let unlabeled = await unlabeledButtons()
check('POS has no unlabeled buttons', unlabeled.length === 0)
if (unlabeled.length) console.log('[a11y] POS:', unlabeled)

await page.goto(`${baseUrl}/products`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(700)
unlabeled = await unlabeledButtons()
check('Products has no unlabeled buttons', unlabeled.length === 0)
if (unlabeled.length) console.log('[a11y] Products:', unlabeled)

await page.goto(`${baseUrl}/sales`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(700)
unlabeled = await unlabeledButtons()
check('Sales has no unlabeled buttons', unlabeled.length === 0)
if (unlabeled.length) console.log('[a11y] Sales:', unlabeled)

// --- Mobile responsive ---
await page.setViewportSize({ width: 390, height: 844 })

await page.goto(`${baseUrl}/pos`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(800)
check('mobile POS no horizontal overflow', await noHorizontalOverflow())
check(
    'mobile menu toggle visible',
    await page.locator('.navbar-toggle-menu').isVisible(),
)
check(
    'mobile complete sale visible',
    await page.getByRole('button', { name: /COMPLETAR VENTA/ }).isVisible(),
)
await page.locator('.navbar-toggle-menu').click()
await page.waitForTimeout(400)
check(
    'mobile sidenav opens',
    !(await page.locator('.side-nav').getAttribute('class')).includes(
        'hidden',
    ),
)
await page.locator('.side-nav .overlay').click({ force: true })
await page.waitForTimeout(400)

await page.goto(`${baseUrl}/products`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(700)
check('mobile Products no horizontal overflow', await noHorizontalOverflow())

await page.goto(`${baseUrl}/settings`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(700)
check('mobile Settings no horizontal overflow', await noHorizontalOverflow())

// --- Light theme is forced regardless of system preference ---
const darkContext = await browser.newContext({ colorScheme: 'dark' })
const darkPage = await darkContext.newPage()
await darkPage.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' })
await darkPage.waitForTimeout(600)
const darkTheme = await darkPage.evaluate(() => ({
    mainL: getComputedStyle(document.documentElement)
        .getPropertyValue('--bulma-scheme-main-l')
        .trim(),
    brightness: getComputedStyle(document.documentElement)
        .getPropertyValue('--bulma-scheme-brightness')
        .trim(),
    colorScheme: getComputedStyle(document.documentElement).colorScheme,
}))
check(
    'dark system preference ignored',
    darkTheme.mainL === '100%' &&
        darkTheme.brightness === 'light' &&
        darkTheme.colorScheme === 'light',
)
await darkContext.close()

console.log('\n--- errors ---')
console.log(errors.length ? errors.join('\n') : 'none')

await browser.close()

if (errors.length || checks.some(item => !item.ok)) {
    process.exitCode = 1
}

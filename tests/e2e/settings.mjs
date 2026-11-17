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

// --- Store settings ---
await page.goto(`${baseUrl}/settings`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(900)
let storeTab = page.locator('.tab-item:visible').first()
const textInputs = storeTab.locator('input:not([type=file])')
await textInputs.nth(0).fill('Tienda Nueva')
await textInputs.nth(1).fill('Calle Principal 123')
await textInputs.nth(2).fill('555-9000')
await textInputs.nth(3).fill('LEGAL-001')
await textInputs.nth(4).fill('€')

await storeTab
    .locator('input[type=file]')
    .setInputFiles(
        '/Users/luisjcenteno/Projects/adm2/public/icon.png',
    )
await page.waitForTimeout(600)
await storeTab.locator('button[type=submit]').click()
await page.waitForTimeout(1200)

check(
    'store save toast',
    (await page.getByText('Se guardaron los datos').count()) > 0,
)
check(
    'sidenav store name updated',
    (await page.locator('.side-nav').innerText()).includes('Tienda Nueva'),
)
const logoSrc = await page.locator('.side-nav img.logo').getAttribute('src')
check('store logo updated', logoSrc && logoSrc.startsWith('data:image'))

await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForTimeout(900)
storeTab = page.locator('.tab-item:visible').first()
const reloadedInputs = storeTab.locator('input:not([type=file])')
check(
    'store settings persist',
    (await reloadedInputs.nth(0).inputValue()) === 'Tienda Nueva' &&
        (await reloadedInputs.nth(4).inputValue()) === '€',
)

// --- POS settings ---
await page
    .locator('.tabs a')
    .filter({ hasText: 'Punto de venta' })
    .click()
await page.waitForTimeout(600)
const messageInput = page.getByPlaceholder('Ej: Gracias por su compra')
await messageInput.fill('Gracias por su compra')
await page.waitForTimeout(1600)
check(
    'pos settings save toast',
    (await page.getByText('Ajustes guardados').count()) > 0,
)

await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForTimeout(900)
await page
    .locator('.tabs a')
    .filter({ hasText: 'Punto de venta' })
    .click()
await page.waitForTimeout(500)
check(
    'pos settings persist',
    (await page.getByPlaceholder('Ej: Gracias por su compra').inputValue()) ===
        'Gracias por su compra',
)

// Currency reaches the global money formatter.
await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1200)
check('currency applied to dashboard', (await page.locator('body').innerText()).includes('€'))

// --- Database tab present ---
await page.goto(`${baseUrl}/settings`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(700)
await page
    .locator('.tabs a')
    .filter({ hasText: 'Base de datos' })
    .click()
await page.waitForTimeout(500)
const dbText = await page.locator('.tab-item:visible').innerText()
check(
    'database export/import visible',
    dbText.includes('Exportar copia de seguridad') &&
        dbText.includes('Importar copia de seguridad'),
)

console.log('\n--- errors ---')
console.log(errors.length ? errors.join('\n') : 'none')

await browser.close()

if (errors.length || checks.some(item => !item.ok)) {
    process.exitCode = 1
}

import { launchBrowser } from './browser.mjs'

const baseUrl = process.env.SMOKE_URL || 'http://127.0.0.1:4173'
const browser = await launchBrowser()
const context = await browser.newContext()
const page = await context.newPage()

const errors = []
const warnings = []

page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
    if (message.type() === 'warning') warnings.push(message.text())
})
page.on('pageerror', error => errors.push(error.stack || error.message))

// --- Registration (empty DB) ---
await page.goto(`${baseUrl}/registration`, { waitUntil: 'domcontentloaded' })
await page.getByPlaceholder('Nombre y apellido').fill('Admin')
await page
    .getByPlaceholder('Nombre de usuario para inicio de sesión')
    .fill('admin')
await page.getByPlaceholder('Al menos 6 caracteres').fill('secret123')
await page.getByPlaceholder('Se mostrará en los recibos').fill('Tienda Test')
await page.getByRole('button', { name: 'Crear cuenta' }).click()
await page.waitForTimeout(1500)

console.log('[register] url=', page.url())
console.log(
    '[register] storage=',
    await page.evaluate(() => JSON.stringify({ ...localStorage })),
)

try {
    await page.waitForFunction(() => window.location.pathname === '/', null, {
        timeout: 5000,
    })
} catch {
    console.log('[register] did not reach /')
}
await page.waitForTimeout(1200)

const routes = [
    ['/', 'dashboard'],
    ['/pos', 'pos'],
    ['/products', 'products'],
    ['/inventories', 'inventories'],
    ['/sales', 'sales'],
    ['/customers', 'customers'],
    ['/providers', 'providers'],
    ['/cashbox', 'cashbox'],
    ['/settings', 'settings'],
    ['/employees', 'employees'],
    ['/routes', 'routes'],
    ['/about', 'about'],
]

for (const [path, label] of routes) {
    const before = errors.length
    await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(900)

    const appLength = (await page.locator('#app').innerHTML()).length
    const text = (await page.locator('body').innerText())
        .replace(/\s+/g, ' ')
        .slice(0, 140)
    const newErrors = errors.length - before

    console.log(
        `[${label}] path=${page.url().replace(baseUrl, '')} app=${appLength} newErrors=${newErrors} text="${text}"`,
    )
}

// --- Login round-trip ---
await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1000)
console.log('[login-page] url=', page.url())
console.log(
    '[login-page] text=',
    (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 180),
)
const inputs = page.locator('input:not([readonly])')
await inputs.nth(0).fill('admin')
await inputs.nth(1).fill('secret123')
await page.getByRole('button', { name: 'Iniciar sesión' }).click()
await page.waitForFunction(() => window.location.pathname === '/', null, {
    timeout: 10000,
})
console.log('[login] round-trip ok')

console.log('\n--- page errors ---')
console.log(errors.length ? errors.join('\n') : 'none')

console.log('\n--- console warnings (first 20) ---')
console.log(warnings.slice(0, 20).join('\n') || 'none')

await browser.close()

if (errors.length) {
    process.exitCode = 1
}

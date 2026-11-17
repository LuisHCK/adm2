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

// --- Employees placeholder screen ---
await page.goto(`${baseUrl}/employees`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(700)
let body = await page.locator('body').innerText()
check(
    'employees screen renders',
    body.includes('Empleados') && body.includes('Nuevo'),
)

// --- Routes create ---
await page.goto(`${baseUrl}/routes`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(700)
body = await page.locator('body').innerText()
check('routes screen renders', body.includes('Rutas'))

await page.getByRole('button', { name: 'Nuevo' }).click()
await visibleModal().waitFor({ state: 'visible', timeout: 5000 })
await visibleModal().getByPlaceholder('Nombre de la ruta').fill('Ruta Test')
await visibleModal().getByPlaceholder('Numero de contacto').fill('555-7777')
await visibleModal()
    .locator('textarea')
    .fill('Descripción de la ruta')
await visibleModal().locator('button[type=submit]').click()
await page.waitForTimeout(1000)
body = await page.locator('body').innerText()
check(
    'route created',
    body.includes('Ruta Test') &&
        body.includes('555-7777') &&
        body.includes('Descripción de la ruta'),
)

// --- About ---
await page.goto(`${baseUrl}/about`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(500)
check(
    'about screen renders',
    (await page.locator('body').innerText()).includes('This is an about page'),
)

console.log('\n--- errors ---')
console.log(errors.length ? errors.join('\n') : 'none')

await browser.close()

if (errors.length || checks.some(item => !item.ok)) {
    process.exitCode = 1
}

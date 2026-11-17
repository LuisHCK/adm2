import { launchBrowser } from './browser.mjs'
import { readFileSync } from 'node:fs'

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

async function fillRegistration({ username, password, company }) {
    await page.getByPlaceholder('Nombre y apellido').fill('Admin')
    await page
        .getByPlaceholder('Nombre de usuario para inicio de sesión')
        .fill(username)
    await page.getByPlaceholder('Al menos 6 caracteres').fill(password)
    await page.getByPlaceholder('Se mostrará en los recibos').fill(company)
}

// --- First run registration ---
await page.goto(`${baseUrl}/registration`, { waitUntil: 'domcontentloaded' })
await fillRegistration({
    username: 'admin',
    password: 'secret123',
    company: 'Tienda Test',
})
await page.getByRole('button', { name: 'Crear cuenta' }).click()
await page.waitForFunction(() => window.location.pathname === '/', null, {
    timeout: 10000,
})
await page.waitForTimeout(1000)
console.log('[register] ok')

// --- Logout clears the session ---
await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(600)
await page.getByText('Cerrar sesión', { exact: true }).click()
await page.getByRole('button', { name: 'Confirmar' }).click()
await page.waitForFunction(() => window.location.pathname === '/login', null, {
    timeout: 10000,
})
console.log('[logout] redirected to login')

await page.goto(`${baseUrl}/products`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(800)
const guarded = page.url().endsWith('/login')
console.log(`[logout] guarded route -> ${page.url()} ok=${guarded}`)

// --- Login again ---
await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(500)
const inputs = page.locator('input:not([readonly])')
await inputs.nth(0).fill('admin')
await inputs.nth(1).fill('secret123')
await page.getByRole('button', { name: 'Iniciar sesión' }).click()
await page.waitForFunction(() => window.location.pathname === '/', null, {
    timeout: 10000,
})
console.log('[login] ok')

// --- Backup export ---
await page.goto(`${baseUrl}/settings`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(800)
await page
    .locator('.tabs a')
    .filter({ hasText: 'Base de datos' })
    .click()
await page.waitForTimeout(500)

const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Exportar copia de seguridad' }).click(),
])
const downloadPath = await download.path()
const filename = download.suggestedFilename()
const dump = readFileSync(downloadPath, 'utf8')
const exportOk =
    filename.endsWith('.json') &&
    dump.includes('"formatName":"dexie"') &&
    dump.includes('"databaseName":"adm_2"')

console.log(
    `[export] file=${filename} bytes=${dump.length} ok=${exportOk}`,
)

// --- Backup import ---
const fileInputs = await page
    .locator('input[type=file]')
    .evaluateAll(elements =>
        elements.map(element => ({
            visible: !!(
                element.offsetWidth ||
                element.offsetHeight ||
                element.getClientRects().length
            ),
            accept: element.accept,
            parentText: (element.closest('.tab-item')?.innerText || '')
                .replace(/\s+/g, ' ')
                .slice(0, 80),
        })),
    )
console.log('[import] file inputs:', JSON.stringify(fileInputs))

await page.locator('input[type=file]').last().setInputFiles(downloadPath)
await page.waitForTimeout(1000)
console.log(
    '[import] after file:',
    (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(-220),
)
await page.getByRole('button', { name: 'Si, contunar' }).click()

await page.waitForTimeout(3000)
await page.waitForLoadState('domcontentloaded')

const bodyText = await page.locator('body').innerText()
const importOk =
    page.url().endsWith('/settings') && bodyText.includes('Tienda Test')
console.log(
    `[import] url=${page.url()} store=${bodyText.includes('Tienda Test')} app=${(await page.locator('#app').innerHTML()).length} ok=${importOk}`,
)

console.log('\n--- errors ---')
console.log(errors.length ? errors.join('\n') : 'none')

await browser.close()

if (errors.length || !guarded || !exportOk || !importOk) {
    process.exitCode = 1
}

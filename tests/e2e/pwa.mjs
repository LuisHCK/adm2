import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { launchBrowser } from './browser.mjs'

const baseUrl = process.env.SMOKE_URL || 'http://127.0.0.1:4173'
const repoRoot = fileURLToPath(new URL('../../', import.meta.url))
const distDir = join(repoRoot, 'dist')
const browser = await launchBrowser()
const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
})
const page = await context.newPage()

const errors = []
page.on('pageerror', error => errors.push(error.stack || error.message))
page.on('console', message => {
    if (message.type() !== 'error') return
    // Expected while the browser context is explicitly offline.
    if (message.text().includes('ERR_INTERNET_DISCONNECTED')) return

    errors.push(message.text())
})

const checks = []
const check = (name, value) => {
    checks.push({ name, ok: !!value })
    console.log(`[${value ? 'ok' : 'FAIL'}] ${name}`)
}

// --- Static PWA artifacts ---
check(
    'service worker generated',
    existsSync(join(distDir, 'sw.js')) &&
        existsSync(join(distDir, 'registerSW.js')),
)
check(
    'auto-update service worker',
    readFileSync(join(distDir, 'sw.js'), 'utf8').includes('skipWaiting'),
)
check(
    'legacy service worker cleanup emitted',
    existsSync(join(distDir, 'service-worker.js')) &&
        readFileSync(join(distDir, 'service-worker.js'), 'utf8').includes(
            'unregister',
        ),
)
check(
    'legacy worker not precached',
    !readFileSync(join(distDir, 'sw.js'), 'utf8').includes(
        'service-worker.js',
    ),
)

const assetsDir = join(distDir, 'assets')
const indexFile = readdirSync(assetsDir).find(file =>
    /^index-.*\.js$/.test(file),
)
const bundleSize = indexFile
    ? statSync(join(assetsDir, indexFile)).size
    : Number.MAX_SAFE_INTEGER
console.log(
    `[bundle] ${indexFile} = ${(bundleSize / 1024).toFixed(1)} kB`,
)
check('main bundle within 800 kB', bundleSize <= 800 * 1024)

// --- Register to create offline data ---
await page.goto(`${baseUrl}/registration`, { waitUntil: 'domcontentloaded' })
await page.getByPlaceholder('Nombre y apellido').fill('Admin')
await page
    .getByPlaceholder('Nombre de usuario para inicio de sesión')
    .fill('admin')
await page.getByPlaceholder('Al menos 6 caracteres').fill('secret123')
await page.getByPlaceholder('Se mostrará en los recibos').fill('Tienda Offline')
await page.getByRole('button', { name: 'Crear cuenta' }).click()
await page.waitForFunction(() => window.location.pathname === '/', null, {
    timeout: 10000,
})
await page.waitForTimeout(700)

const manifest = await page.evaluate(async () =>
    (await fetch('/manifest.webmanifest')).json(),
)
check(
    'manifest present with icons',
    manifest.name &&
        manifest.icons &&
        manifest.icons.length >= 2 &&
        manifest.lang === 'es',
)

const manifestHref = await page
    .locator('link[rel="manifest"]')
    .getAttribute('href')
check('manifest linked', manifestHref === '/manifest.webmanifest')

// --- Service worker control ---
await page.evaluate(async () => {
    if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.ready
    }
})

try {
    await page.waitForFunction(
        () => !!navigator.serviceWorker.controller,
        null,
        { timeout: 10000 },
    )
} catch {
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForFunction(
        () => !!navigator.serviceWorker.controller,
        null,
        { timeout: 10000 },
    )
}

check(
    'service worker controls page',
    await page.evaluate(() => !!navigator.serviceWorker.controller),
)

// --- Offline shell + data ---
await context.setOffline(true)
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1200)

let body = await page.locator('body').innerText()
check(
    'offline shell renders',
    body.includes('Tienda Offline') && body.includes('Inicio'),
)

await page.goto(`${baseUrl}/products`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(900)
body = await page.locator('body').innerText()
check('offline route renders', body.includes('Productos'))

await context.setOffline(false)

console.log('\n--- errors ---')
console.log(errors.length ? errors.join('\n') : 'none')

await browser.close()

if (errors.length || checks.some(item => !item.ok)) {
    process.exitCode = 1
}

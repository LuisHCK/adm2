import { launchBrowser } from './browser.mjs'
import { mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const baseUrl = process.env.SMOKE_URL || 'http://127.0.0.1:4173'
const outDir = process.env.SHOT_DIR || join(tmpdir(), 'adm2-shots')

mkdirSync(outDir, { recursive: true })

const browser = await launchBrowser()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const errors = []
page.on('pageerror', error => errors.push(error.stack || error.message))
page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
})

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
await page.waitForTimeout(1200)

async function shot(path, name) {
    await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1000)
    const file = `${outDir}/${name}.png`
    await page.screenshot({ path: file, fullPage: false })
    console.log(`${name}: ${file}`)
}

await shot('/', 'dashboard')
await shot('/products', 'products')
await shot('/pos', 'pos')
await shot('/settings', 'settings')

// Open the "Nuevo producto" modal from the navbar actions.
await page.goto(`${baseUrl}/products`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(800)
await page.locator('.action-buttons .navbar-item').click()
await page
    .locator('.dropdown-content .dropdown-item')
    .filter({ hasText: 'Nuevo' })
    .first()
    .click()
await page.waitForTimeout(600)
const modalFile = `${outDir}/product-modal.png`
await page.screenshot({ path: modalFile, fullPage: false })
console.log(`product-modal: ${modalFile}`)

console.log('errors:', errors.length ? errors.join('\n') : 'none')

await browser.close()

if (errors.length) process.exitCode = 1

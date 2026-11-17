import { launchBrowser } from './browser.mjs'

const baseUrl = process.env.SMOKE_URL || 'http://127.0.0.1:4173'
const browser = await launchBrowser()
const page = await browser.newPage()

const errors = []
const warnings = []

page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
    if (message.type() === 'warning') warnings.push(message.text())
})
page.on('pageerror', error => errors.push(error.stack || error.message))

async function visit(path, label) {
    await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1200)

    const app = page.locator('#app')
    const text = (await page.locator('body').innerText()).slice(0, 220)
    const appLength = (await app.innerHTML()).length

    console.log(`\n[${label}] url=${page.url()}`)
    console.log(`[${label}] #app length=${appLength}`)
    console.log(`[${label}] text=${text.replace(/\n/g, ' | ')}`)
}

await visit('/login', 'login')
await visit('/', 'root')

console.log('\n--- page errors ---')
console.log(errors.length ? errors.join('\n') : 'none')

console.log('\n--- console warnings (first 15) ---')
console.log(warnings.slice(0, 15).join('\n') || 'none')

await browser.close()

if (errors.length) {
    process.exitCode = 1
}

import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

const baseUrl = process.env.SMOKE_URL || 'http://127.0.0.1:4173'
const scripts = [
    'boot-gate.mjs',
    'auth-backup.mjs',
    'catalog.mjs',
    'inventory.mjs',
    'pos.mjs',
    'sales.mjs',
    'cashbox.mjs',
    'dashboard.mjs',
    'settings.mjs',
    'a11y.mjs',
    'pwa.mjs',
    'misc.mjs',
]

const preview = spawn(
    'npx',
    [
        'vite',
        'preview',
        '--host',
        '127.0.0.1',
        '--port',
        '4173',
        '--strictPort',
    ],
    { stdio: 'ignore' },
)

function stopPreview() {
    if (!preview.killed) {
        preview.kill('SIGTERM')
    }
}

process.on('SIGINT', () => {
    stopPreview()
    process.exit(130)
})

async function waitForPreview() {
    for (let attempt = 0; attempt < 40; attempt += 1) {
        try {
            const response = await fetch(`${baseUrl}/login`)
            if (response.ok) return
        } catch {
            // not ready yet
        }
        await sleep(500)
    }
    throw new Error(`Preview server did not start at ${baseUrl}`)
}

function runScript(script) {
    return new Promise(resolve => {
        const child = spawn('node', [`tests/e2e/${script}`], {
            stdio: 'inherit',
            env: { ...process.env, SMOKE_URL: baseUrl },
        })
        child.on('exit', code => resolve(code ?? 1))
    })
}

try {
    await waitForPreview()
    console.log(`[e2e] preview ready at ${baseUrl}`)

    let failed = false

    for (const script of scripts) {
        console.log(`\n[e2e] running ${script}`)
        const code = await runScript(script)

        if (code !== 0) {
            console.error(`[e2e] FAILED ${script} (exit ${code})`)
            failed = true
            break
        }
    }

    if (failed) {
        process.exitCode = 1
    } else {
        console.log('\n[e2e] all suites passed')
    }
} finally {
    stopPreview()
}

import { chromium } from '@playwright/test'

/**
 * Local runs use the installed Google Chrome; CI uses the bundled Chromium
 * (`PLAYWRIGHT_CHANNEL=bundled`).
 */
export function launchBrowser() {
    const channel = process.env.PLAYWRIGHT_CHANNEL || 'chrome'

    return chromium.launch({
        headless: true,
        ...(channel === 'bundled' ? {} : { channel }),
    })
}

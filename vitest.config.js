import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    test: {
        environment: 'node',
        setupFiles: ['./tests/unit/characterization/setup.js'],
        include: ['tests/unit/characterization/**/*.spec.js'],
    },
})

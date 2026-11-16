import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    plugins: [
        {
            // The legacy app imports EJS templates directly; the Vue CLI build
            // handled them with raw-loader. Mirror that for characterization tests.
            name: 'ejs-as-raw',
            transform(code, id) {
                if (id.endsWith('.ejs')) {
                    return {
                        code: `export default ${JSON.stringify(code)}`,
                        map: null,
                    }
                }
            },
        },
    ],
    test: {
        environment: 'node',
        include: ['tests/unit/characterization/**/*.spec.js'],
    },
})

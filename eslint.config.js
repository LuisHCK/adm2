import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'

export default [
    {
        ignores: ['dist/**', 'node_modules/**', 'docs/**', 'public/**'],
    },
    ...pluginVue.configs['flat/essential'],
    {
        files: ['**/*.{js,mjs,vue}'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        rules: {
            'vue/multi-word-component-names': 'off',
            'vue/no-v-html': 'off',
            'vue/require-default-prop': 'off',
            'vue/no-unused-components': 'warn',
            'vue/no-unused-vars': 'warn',
            'no-unused-vars': 'warn',
            'no-undef': 'error',
            'no-console': 'off',
        },
    },
]

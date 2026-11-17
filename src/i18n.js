import { createI18n } from 'vue-i18n'

function loadLocaleMessages() {
    const locales = import.meta.glob('./locales/*.json', { eager: true })
    const messages = {}

    Object.entries(locales).forEach(([path, module]) => {
        const matched = path.match(/([A-Za-z0-9-_]+)\.json$/i)
        if (matched && matched.length > 1) {
            messages[matched[1]] = module.default || module
        }
    })

    return messages
}

export default createI18n({
    legacy: false,
    globalInjection: true,
    locale: import.meta.env.VITE_I18N_LOCALE || 'es',
    fallbackLocale: import.meta.env.VITE_I18N_FALLBACK_LOCALE || 'es',
    messages: loadLocaleMessages(),
})

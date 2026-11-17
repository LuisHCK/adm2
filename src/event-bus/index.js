import mitt from 'mitt'

const emitter = mitt()
let buefy = {}

/**
 * Drop-in replacement for the old `new Vue()` event bus.
 * Keeps the `$on` / `$off` / `$emit` / `$buefy` surface so call sites do not change.
 */
const EventBus = {
    $on(event, handler) {
        emitter.on(event, handler)
    },

    $off(event, handler) {
        emitter.off(event, handler)
    },

    $emit(event, payload) {
        emitter.emit(event, payload)
    },

    get $buefy() {
        return buefy
    },
}

/**
 * Wire the programmatic Buefy APIs from the installed app.
 * @param {Object} instance `app.config.globalProperties.$buefy`
 */
export function setBuefy(instance) {
    buefy = instance || {}
}

export { emitter }
export default EventBus
